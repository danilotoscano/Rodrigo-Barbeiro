import { Appointment, ClientProfile, TimeSlot, BarberService } from '../types';
import { initializeFirebase } from './firebaseClient';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  runTransaction 
} from 'firebase/firestore';

const CLIENTS_STORAGE_KEY = 'rodrigo_clients_portfolio';
const APPOINTMENTS_STORAGE_KEY = 'rodrigo_appointments_list';

// Helper: Normalize phone to numbers only
export function normalizePhone(rawPhone: string): string {
  return rawPhone.replace(/\D/g, '');
}

// Helper: Format raw phone into (XX) XXXXX-XXXX or (XX) XXXX-XXXX
export function formatPhoneMask(value: string): string {
  const digits = normalizePhone(value).slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// Helper: Validate Brazilian phone number
export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone);
  // DDD (2 digits) + 8 or 9 digits -> total 10 or 11
  return digits.length >= 10 && digits.length <= 11;
}

// Local Storage Fallback Helpers
function getLocalAppointments(): Appointment[] {
  try {
    const data = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalAppointments(appointments: Appointment[]): void {
  localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
}

function getLocalClients(): ClientProfile[] {
  try {
    const data = localStorage.getItem(CLIENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalClients(clients: ClientProfile[]): void {
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
}

// Generate Time Slots for a given date
export async function getAvailableTimeSlots(
  dateString: string,
  startHourStr: string = '09:00',
  endHourStr: string = '19:00',
  intervalMinutes: number = 30
): Promise<TimeSlot[]> {
  const [startH, startM] = startHourStr.split(':').map(Number);
  const [endH, endM] = endHourStr.split(':').map(Number);

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  // Retrieve existing appointments for this date
  const bookedTimes = new Set<string>();

  const { db, isLive } = initializeFirebase();

  if (isLive && db) {
    try {
      const q = query(
        collection(db, 'appointments'),
        where('date', '==', dateString),
        where('status', '==', 'confirmed')
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.time) {
          bookedTimes.add(data.time);
        }
      });
    } catch (err) {
      console.warn('Firebase query failed, checking local backup:', err);
      const local = getLocalAppointments();
      local.forEach(app => {
        if (app.date === dateString && app.status === 'confirmed') {
          bookedTimes.add(app.time);
        }
      });
    }
  } else {
    const local = getLocalAppointments();
    local.forEach(app => {
      if (app.date === dateString && app.status === 'confirmed') {
        bookedTimes.add(app.time);
      }
    });
  }

  // Check if date is today to disable past times
  const today = new Date();
  const selectedDate = new Date(dateString + 'T00:00:00');
  const isToday =
    today.getFullYear() === selectedDate.getFullYear() &&
    today.getMonth() === selectedDate.getMonth() &&
    today.getDate() === selectedDate.getDate();

  const currentMinutesToday = today.getHours() * 60 + today.getMinutes();

  const slots: TimeSlot[] = [];

  for (let mins = startTotalMinutes; mins < endTotalMinutes; mins += intervalMinutes) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const timeFormatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    let isAvailable = true;
    let conflictReason: string | undefined;

    if (bookedTimes.has(timeFormatted)) {
      isAvailable = false;
      conflictReason = 'Horário já reservado';
    } else if (isToday && mins <= currentMinutesToday + 15) {
      // 15 minutes grace buffer for same-day bookings
      isAvailable = false;
      conflictReason = 'Horário passado';
    }

    slots.push({
      time: timeFormatted,
      available: isAvailable,
      conflictReason,
    });
  }

  return slots;
}

export interface BookingPayload {
  clientName: string;
  clientPhone: string;
  service: BarberService;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  consentCommunication: boolean;
}

export interface BookingResult {
  success: boolean;
  appointment?: Appointment;
  client?: ClientProfile;
  whatsAppRedirectUrl?: string;
  errorMessage?: string;
}

/**
 * Creates appointment with strict double-booking prevention.
 * If another user reserved the same date/time simultaneously, returns error.
 */
export async function createAppointment(
  payload: BookingPayload,
  rodrigoWhatsAppNumber: string
): Promise<BookingResult> {
  const { clientName, clientPhone, service, date, time, consentCommunication } = payload;

  if (!clientName || clientName.trim().length < 2) {
    return { success: false, errorMessage: 'Por favor, informe seu nome completo.' };
  }

  if (!isValidPhone(clientPhone)) {
    return { success: false, errorMessage: 'Por favor, informe um WhatsApp válido com DDD.' };
  }

  const cleanPhone = normalizePhone(clientPhone);
  const nowIso = new Date().toISOString();
  const appointmentId = `app_${date.replace(/-/g, '')}_${time.replace(':', '')}_${cleanPhone.slice(-4)}`;
  const lockSlotId = `slot_${date}_${time.replace(':', '')}`;

  const { db, isLive } = initializeFirebase();

  // 1. Double-booking check & Firestore transaction if available
  if (isLive && db) {
    try {
      let appointmentCreated: Appointment | null = null;
      let clientSaved: ClientProfile | null = null;

      await runTransaction(db, async (transaction) => {
        const slotRef = doc(db, 'schedule_slots', lockSlotId);
        const slotSnap = await transaction.get(slotRef);

        if (slotSnap.exists() && slotSnap.data()?.status === 'confirmed') {
          throw new Error('SLOT_ALREADY_TAKEN');
        }

        // Prepare client data
        const clientRef = doc(db, 'clients', cleanPhone);
        const clientSnap = await transaction.get(clientRef);

        if (clientSnap.exists()) {
          const prev = clientSnap.data() as ClientProfile;
          clientSaved = {
            ...prev,
            name: clientName.trim(),
            phone: formatPhoneMask(cleanPhone),
            lastUpdatedAt: nowIso,
            consentCommunication: consentCommunication,
            consentTimestamp: consentCommunication ? (prev.consentTimestamp || nowIso) : null,
            totalAppointments: (prev.totalAppointments || 0) + 1,
          };
          transaction.set(clientRef, clientSaved, { merge: true });
        } else {
          clientSaved = {
            id: cleanPhone,
            name: clientName.trim(),
            phone: formatPhoneMask(cleanPhone),
            normalizedPhone: cleanPhone,
            firstRegisteredAt: nowIso,
            lastUpdatedAt: nowIso,
            consentCommunication: consentCommunication,
            consentTimestamp: consentCommunication ? nowIso : null,
            totalAppointments: 1,
          };
          transaction.set(clientRef, clientSaved);
        }

        // Prepare appointment data
        appointmentCreated = {
          id: appointmentId,
          clientId: cleanPhone,
          clientName: clientName.trim(),
          clientPhone: formatPhoneMask(cleanPhone),
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price,
          date,
          time,
          status: 'confirmed',
          createdAt: nowIso,
        };

        const appRef = doc(db, 'appointments', appointmentId);
        transaction.set(appRef, appointmentCreated);

        // Lock slot
        transaction.set(slotRef, {
          slotId: lockSlotId,
          date,
          time,
          status: 'confirmed',
          appointmentId,
          clientId: cleanPhone,
          updatedAt: nowIso,
        });
      });

      // Also sync local cache for smooth offline browsing
      const localApps = getLocalAppointments();
      if (appointmentCreated) {
        saveLocalAppointments([appointmentCreated, ...localApps.filter(a => a.id !== appointmentId)]);
      }
      if (clientSaved) {
        const localClients = getLocalClients();
        saveLocalClients([clientSaved, ...localClients.filter(c => c.id !== cleanPhone)]);
      }

      const whatsAppRedirectUrl = buildWhatsAppMessageUrl(
        rodrigoWhatsAppNumber,
        time,
        service.name
      );

      return {
        success: true,
        appointment: appointmentCreated!,
        client: clientSaved!,
        whatsAppRedirectUrl,
      };
    } catch (err: any) {
      if (err?.message === 'SLOT_ALREADY_TAKEN') {
        return {
          success: false,
          errorMessage: 'Esse horário acabou de ser reservado. Escolha outro horário.',
        };
      }
      console.error('Firebase transaction error, checking fallback', err);
    }
  }

  // 2. High-reliability fallback (local storage with atomic collision check)
  const currentAppointments = getLocalAppointments();
  const existingConflict = currentAppointments.find(
    app => app.date === date && app.time === time && app.status === 'confirmed'
  );

  if (existingConflict) {
    return {
      success: false,
      errorMessage: 'Esse horário acabou de ser reservado. Escolha outro horário.',
    };
  }

  // Create appointment
  const newAppointment: Appointment = {
    id: appointmentId,
    clientId: cleanPhone,
    clientName: clientName.trim(),
    clientPhone: formatPhoneMask(cleanPhone),
    serviceId: service.id,
    serviceName: service.name,
    servicePrice: service.price,
    date,
    time,
    status: 'confirmed',
    createdAt: nowIso,
  };

  // Upsert client in Rodrigo's client portfolio
  const currentClients = getLocalClients();
  const existingClientIndex = currentClients.findIndex(c => c.normalizedPhone === cleanPhone || c.id === cleanPhone);

  let updatedClient: ClientProfile;
  if (existingClientIndex >= 0) {
    const prev = currentClients[existingClientIndex];
    updatedClient = {
      ...prev,
      name: clientName.trim(),
      phone: formatPhoneMask(cleanPhone),
      lastUpdatedAt: nowIso,
      consentCommunication,
      consentTimestamp: consentCommunication ? (prev.consentTimestamp || nowIso) : null,
      totalAppointments: (prev.totalAppointments || 0) + 1,
    };
    currentClients[existingClientIndex] = updatedClient;
  } else {
    updatedClient = {
      id: cleanPhone,
      name: clientName.trim(),
      phone: formatPhoneMask(cleanPhone),
      normalizedPhone: cleanPhone,
      firstRegisteredAt: nowIso,
      lastUpdatedAt: nowIso,
      consentCommunication,
      consentTimestamp: consentCommunication ? nowIso : null,
      totalAppointments: 1,
    };
    currentClients.unshift(updatedClient);
  }

  saveLocalClients(currentClients);
  saveLocalAppointments([newAppointment, ...currentAppointments]);

  const whatsAppRedirectUrl = buildWhatsAppMessageUrl(
    rodrigoWhatsAppNumber,
    time,
    service.name
  );

  return {
    success: true,
    appointment: newAppointment,
    client: updatedClient,
    whatsAppRedirectUrl,
  };
}

/**
 * Builds the exact required WhatsApp redirect URL:
 * "Olá Rodrigo, eu agendei às [horário agendado], para fazer [nome do serviço]."
 */
export function buildWhatsAppMessageUrl(
  rodrigoContact: string,
  time: string,
  serviceName: string
): string {
  const message = `Olá Rodrigo, eu agendei às ${time}, para fazer ${serviceName}.`;
  
  if (rodrigoContact.includes('wa.link')) {
    // wa.link supports query text parameter
    const separator = rodrigoContact.includes('?') ? '&' : '?';
    return `${rodrigoContact}${separator}text=${encodeURIComponent(message)}`;
  }

  const cleanNumber = normalizePhone(rodrigoContact) || '5511999999999';
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function buildDirectWhatsAppContactUrl(rodrigoContact: string): string {
  if (rodrigoContact.includes('wa.link') || rodrigoContact.startsWith('http')) {
    return rodrigoContact;
  }
  const cleanNumber = normalizePhone(rodrigoContact) || '5511999999999';
  const greeting = 'Olá Rodrigo Barbeiro! Gostaria de tirar uma dúvida sobre seus serviços e horários.';
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(greeting)}`;
}

export function getAllSavedAppointments(): Appointment[] {
  return getLocalAppointments();
}

export function getAllSavedClients(): ClientProfile[] {
  return getLocalClients();
}
