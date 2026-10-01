export interface BarberService {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  badge?: string;
  iconName: 'scissors' | 'razor' | 'clipper' | 'color' | 'eyebrow' | 'combo';
}

export interface ClientProfile {
  id: string; // usually normalized phone number e.g. "5511999999999"
  name: string;
  phone: string; // formatted e.g. (11) 98765-4321
  normalizedPhone: string; // digits only e.g. 11987654321
  firstRegisteredAt: string; // ISO string
  lastUpdatedAt: string; // ISO string
  consentCommunication: boolean;
  consentTimestamp: string | null;
  totalAppointments: number;
  notes?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'confirmed' | 'cancelled';
  createdAt: string; // ISO string
}

export interface TimeSlot {
  time: string;
  available: boolean;
  conflictReason?: string;
}

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface RodrigoProfileConfig {
  professionalName: string; // "Rodrigo Barbeiro"
  title: string; // "Barbeiro Profissional"
  slogan: string; // "Seu estilo começa no corte."
  bio: string; // "Atendimento exclusivo com foco em precisão, estilo e conforto."
  whatsappUrl: string; // "https://wa.link/yc9uxu"
  whatsappNumber: string; // fallback digits or link
  whatsappDisplay: string; // "(11) 99999-9999" or link label
  locationUrl: string; // "https://share.google/U3N5Myrp7S5hGsAKX"
  serviceLocation?: string; // e.g. "Espaço parceiro de atendimento"
  serviceAddress?: string; // address or link descriptor
  showLocation: boolean;
  customLogoUrl: string; // "https://i.postimg.cc/SNHdgM96/logomarca-nova-comprimida.png"
  customImages?: string[];
  operatingHours: {
    start: string; // "09:00"
    end: string; // "19:00"
    slotIntervalMinutes: number; // 30
  };
  firebaseConfig?: FirebaseCustomConfig;
}
