import { BarberService, RodrigoProfileConfig } from '../types';

export const OFFICIAL_SERVICES: BarberService[] = [
  {
    id: 'cabelo-e-barba',
    name: 'Cabelo e Barba',
    price: 60,
    durationMinutes: 45,
    description: 'Combo completo com corte moderno ou tradicional, barba desenhada na navalha e finalização.',
    badge: 'Mais Escolhido',
    iconName: 'combo',
  },
  {
    id: 'cabelo',
    name: 'Cabelo',
    price: 35,
    durationMinutes: 45,
    description: 'Corte social, degradê (fade) ou estilizado com acabamento na navalha e lavagem.',
    iconName: 'scissors',
  },
  {
    id: 'barba',
    name: 'Barba',
    price: 25,
    durationMinutes: 30,
    description: 'Barboterapia, alinhamento simétrico, desenho com navalha e hidratação dos fios.',
    iconName: 'razor',
  },
  {
    id: 'pintar-cabelo',
    name: 'Pintar Cabelo',
    price: 20,
    durationMinutes: 45,
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
    url: '/images/cliente-1.jpg',
    title: 'Corte Degradê & Barba',
    category: 'Cabelo & Barba',
  },
  {
    url: '/images/cliente-2.jpg',
    title: 'Fade & Acabamento Navalhado',
    category: 'Degradê Profissional',
  },
  {
    url: '/images/cliente-3.jpg',
    title: 'Barba Alinhada & Estilo',
    category: 'Barba Modelada',
  },
  {
    url: '/images/cliente-4.jpg',
    title: 'Corte Tradicional & Moderno',
    category: 'Corte Masculino',
  },
  {
    url: '/images/cliente-5.jpg',
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
  title: 'Barbeiro no Icaraí, Caucaia-CE',
  slogan: 'Seu estilo começa no corte.',
  bio: 'Especialista em cortes masculinos, degradê, barba, pintura, sobrancelha, acabamento e cuidados com o visual masculino. Atendimento de qualidade, ambiente confortável e focado na autoestima masculina no Icaraí, Caucaia-CE.',
  whatsappUrl: 'https://wa.link/yc9uxu',
  whatsappNumber: '5585981691641',
  whatsappDisplay: '(85) 98169-1641',
  locationUrl: 'https://share.google/U3N5Myrp7S5hGsAKX',
  serviceLocation: 'Espaço de Atendimento no Icaraí',
  serviceAddress: 'Icaraí, Caucaia - CE • Clique para traçar a rota no Maps',
  showLocation: true,
  customLogoUrl: 'https://i.postimg.cc/SNHdgM96/logomarca-nova-comprimida.png',
  customImages: [
    '/images/cliente-1.jpg',
    '/images/cliente-2.jpg',
    '/images/cliente-3.jpg',
    '/images/cliente-4.jpg',
    '/images/cliente-5.jpg',
  ],
  operatingHours: {
    start: '09:00',
    end: '19:00',
    slotIntervalMinutes: 45,
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
