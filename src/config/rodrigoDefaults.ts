import { BarberService, RodrigoProfileConfig } from '../types';

export const OFFICIAL_SERVICES: BarberService[] = [
  {
    id: 'cabelo-e-barba',
    name: 'Cabelo e Barba',
    price: 60,
    durationMinutes: 60,
    description: 'Corte completo com tesoura ou máquina + alinhamento, desenho e toalha quente na barba.',
    badge: 'Mais Procurado',
    iconName: 'combo',
  },
  {
    id: 'cabelo',
    name: 'Cabelo',
    price: 35,
    durationMinutes: 30,
    description: 'Cortes modernos e tradicionais, degradê (fade) profissional e acabamento impecável.',
    iconName: 'scissors',
  },
  {
    id: 'barba',
    name: 'Barba',
    price: 25,
    durationMinutes: 30,
    description: 'Barba modelada e alinhada na navalha com toalha e produtos de hidratação.',
    iconName: 'razor',
  },
  {
    id: 'pintar-cabelo',
    name: 'Pintar Cabelo',
    price: 20,
    durationMinutes: 40,
    description: 'Pigmentação para disfarçar fios brancos ou tonalização uniforme moderna.',
    iconName: 'color',
  },
  {
    id: 'sobrancelha',
    name: 'Sobrancelha',
    price: 10,
    durationMinutes: 15,
    description: 'Design e alinhamento na navalha para valorizar o olhar e o corte.',
    iconName: 'eyebrow',
  },
];

export const RODRIGO_REAL_IMAGES = [
  {
    url: 'https://i.postimg.cc/7hFHW9DF/rodrigo-cliente-1.jpg',
    title: 'Corte Degradê & Barba',
    category: 'Cabelo & Barba',
  },
  {
    url: 'https://i.postimg.cc/yxM1bjB2/rodrigo-cliente-2.jpg',
    title: 'Fade & Acabamento Navalhado',
    category: 'Degradê Profissional',
  },
  {
    url: 'https://i.postimg.cc/j2pxFcKG/rodrigo-cliente-3.jpg',
    title: 'Barba Alinhada & Estilo',
    category: 'Barba Modelada',
  },
  {
    url: 'https://i.postimg.cc/gjCzTsdQ/rodrigo-cliente-4.jpg',
    title: 'Corte Tradicional & Moderno',
    category: 'Corte Masculino',
  },
  {
    url: 'https://i.postimg.cc/cCpxbhZ5/rodrigo-cliente-5.jpg',
    title: 'Alinhamento & Precisão',
    category: 'Design & Acabamento',
  },
];

export const RODRIGO_DIFFERENTIALS = [
  'Cortes modernos e tradicionais',
  'Barba modelada e alinhada',
  'Degradê (Fade) profissional',
  'Acabamentos personalizados',
  'Atendimento com horário agendado',
  'Higiene, conforto e excelência',
];

export const DEFAULT_RODRIGO_CONFIG: RodrigoProfileConfig = {
  professionalName: 'Rodrigo Barbeiro',
  title: 'Barbeiro Profissional',
  slogan: 'Seu estilo começa no corte.',
  bio: 'Especialista em cortes masculinos, degradê, barba, pintura, sobrancelha, acabamento e cuidados com o visual masculino. Atendimento de qualidade, ambiente confortável e focado na autoestima masculina.',
  whatsappUrl: 'https://wa.link/yc9uxu',
  whatsappNumber: '5511999999999',
  whatsappDisplay: 'Chamar no WhatsApp',
  locationUrl: 'https://share.google/U3N5Myrp7S5hGsAKX',
  serviceLocation: 'Espaço parceiro de atendimento',
  serviceAddress: 'Clique para traçar a rota até onde atendo',
  showLocation: true,
  customLogoUrl: 'https://i.postimg.cc/SNHdgM96/logomarca-nova-comprimida.png',
  customImages: [
    'https://i.postimg.cc/7hFHW9DF/rodrigo-cliente-1.jpg',
    'https://i.postimg.cc/yxM1bjB2/rodrigo-cliente-2.jpg',
    'https://i.postimg.cc/j2pxFcKG/rodrigo-cliente-3.jpg',
    'https://i.postimg.cc/gjCzTsdQ/rodrigo-cliente-4.jpg',
    'https://i.postimg.cc/cCpxbhZ5/rodrigo-cliente-5.jpg',
  ],
  operatingHours: {
    start: '09:00',
    end: '19:00',
    slotIntervalMinutes: 30,
  },
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
};
