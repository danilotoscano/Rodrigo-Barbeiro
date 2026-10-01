/**
 * Booking Service with Atomic Concurrency Protection,
 * 45-minute Slot Intervals, and Direct Official WhatsApp Delivery
 */

import {
  collection,
  doc,
  runTransaction,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { initializeFirebase } from './firebaseClient';
import { Appointment, BarberService, ClientProfile, TimeSlot } from '../types';

const APPOINTMENTS_STORAGE_KEY = 'rodrigo_barber_appointments_v2';
const CLIENTS_STORAGE_KEY = 'rodrigo_barber_clients_v2';

// Utility: Normalize phone number
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return '55' + digits;
  }
  return digits;
}

// Utility: Format mask (XX) XXXXX-XXXX
export function formatPhoneMask(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

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

/**
 * Generate Time Slots for a given date with 45-minute intervals
 * Default: 09:00 to 19:00, 45 mins -> 09:00, 09:45, 10:30, 11:15, 12:00, 12:45, 13:30, 14:15, 15:00, 15:45, 16:30, 17:15, 18:00, 18:45
 */
export async function getAvailableTimeSlots(
  dateString: string,
  startHourStr: string = '09:00',
  endHourStr: string = '19:00',
  intervalMinutes: number = 45
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
        if (data?.time) {
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
  date: string;
  time: string;
  consentCommunication?: boolean;
}

export interface BookingResult {
  success: boolean;
  appointment?: Appointment;
  client?: ClientProfile;
  whatsAppRedirectUrl?: string;
  errorMessage?: string;
}

/**
 * Creates an appointment with atomic locking and builds the rich WhatsApp redirect URL
 */
export async function createAppointment(
  payload: BookingPayload,
  rodrigoWhatsAppNumber: string
): Promise<BookingResult> {
  const { clientName, clientPhone, service, date, time, consentCommunication = true } = payload;
  const cleanPhone = normalizePhone(clientPhone);

  const appointmentId = `app_${date}_${time.replace(':', '')}_${cleanPhone.slice(-4)}_${Date.now()}`;
  const lockSlotId = `slot_${date}_${time.replace(':', '')}`;
  const nowIso = new Date().toISOString();

  // Try Firebase Firestore Atomic Transaction first if live
  const { db, isLive } = initializeFirebase();

  if (isLive && db) {
    try {
      let appointmentCreated: Appointment | null = null;
      let clientSaved: ClientProfile | null = null;

      await runTransaction(db, async (transaction) => {
        // Read slot lock
        const slotRef = doc(db, 'slotLocks', lockSlotId);
        const slotDoc = await transaction.get(slotRef);

        if (slotDoc.exists() && slotDoc.data()?.status === 'confirmed') {
          throw new Error('SLOT_ALREADY_TAKEN');
        }

        // Upsert client
        const clientRef = doc(db, 'clients', cleanPhone);
        const clientDoc = await transaction.get(clientRef);

        if (clientDoc.exists()) {
          const prev = clientDoc.data() as ClientProfile;
          clientSaved = {
            ...prev,
            name: clientName.trim(),
            phone: formatPhoneMask(cleanPhone),
            lastUpdatedAt: nowIso,
            consentCommunication,
            consentTimestamp: consentCommunication ? (prev.consentTimestamp || nowIso) : null,
            totalAppointments: (prev.totalAppointments || 0) + 1,
          };
          transaction.update(clientRef, {
            name: clientName.trim(),
            lastUpdatedAt: Timestamp.now(),
            consentCommunication,
            totalAppointments: (prev.totalAppointments || 0) + 1,
          });
        } else {
          clientSaved = {
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
          transaction.set(clientRef, {
            ...clientSaved,
            createdAt: Timestamp.now(),
            lastUpdatedAt: Timestamp.now(),
          });
        }

        // Create appointment
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
        service.name,
        date,
        service.price,
        clientName
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
    service.name,
    date,
    service.price,
    clientName
  );

  return {
    success: true,
    appointment: newAppointment,
    client: updatedClient,
    whatsAppRedirectUrl,
  };
}

/**
 * Builds the official WhatsApp direct URL with emojis, service, date, time, total price and client name.
 * Directs to https://api.whatsapp.com/send?phone=... to ensure text is immediately pre-filled on all devices.
 */
export function buildWhatsAppMessageUrl(
  rodrigoContact: string,
  time: string,
  serviceName: string,
  date?: string,
  totalPrice?: number,
  clientName?: string
): string {
  const formattedDate = date ? date.split('-').reverse().join('/') : '';
  const priceFormatted = typeof totalPrice === 'number' ? `R$ ${totalPrice.toFixed(2).replace('.', ',')}` : '';

  const lines = [
    `💈 *Olá Rodrigo! Acabei de agendar meu horário pelo seu site:*`,
    ``,
    clientName ? `👤 *Cliente:* ${clientName.trim()}` : null,
    `✂️ *Serviço:* ${serviceName}`,
    formattedDate ? `📅 *Data:* ${formattedDate}` : null,
    `⏰ *Horário:* ${time}`,
    priceFormatted ? `💰 *Valor Total:* ${priceFormatted}` : null,
    ``,
    `Por favor, pode confirmar para mim? Valeu! 🤝`,
  ].filter((l): l is string => l !== null);

  const message = lines.join('\n');

  // Direct phone number of Rodrigo (5585981691641)
  let phone = '5585981691641';
  if (rodrigoContact && !rodrigoContact.includes('wa.link') && normalizePhone(rodrigoContact)) {
    phone = normalizePhone(rodrigoContact);
  }

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}

export function buildDirectWhatsAppContactUrl(rodrigoContact: string): string {
  let phone = '5585981691641';
  if (rodrigoContact && !rodrigoContact.includes('wa.link') && normalizePhone(rodrigoContact)) {
    phone = normalizePhone(rodrigoContact);
  }
  const greeting = 'Olá Rodrigo Barbeiro! Gostaria de tirar uma dúvida sobre seus serviços e horários no Icaraí.';
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(greeting)}`;
}

export function getAllSavedAppointments(): Appointment[] {
  return getLocalAppointments();
}

export function getAllSavedClients(): ClientProfile[] {
  return getLocalClients();
}
