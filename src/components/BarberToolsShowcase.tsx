import React from 'react';
import { 
  GoldScissorsIcon, 
  GoldRazorIcon, 
  GoldClipperIcon, 
  GoldCombIcon, 
  GoldBeardIcon, 
  GoldEyebrowIcon 
} from './Gold3DIcons';
import { Calendar, MessageCircle, Sparkles } from 'lucide-react';

export function BarberToolsShowcase() {
  const tools = [
    {
      name: 'Tesoura',
      detail: 'Fio Laser',
      icon: <GoldScissorsIcon size={24} />,
    },
    {
      name: 'Navalha',
      detail: 'Alinhamento',
      icon: <GoldRazorIcon size={24} />,
    },
    {
      name: 'Máquina',
      detail: 'Degradê Limpo',
      icon: <GoldClipperIcon size={24} />,
    },
    {
      name: 'Pente',
      detail: 'Carbono Fino',
      icon: <GoldCombIcon size={24} />,
    },
    {
      name: 'Barba',
      detail: 'Toalha Quente',
      icon: <GoldBeardIcon size={24} />,
    },
    {
      name: 'Sobrancelha',
      detail: 'Design Marcante',
      icon: <GoldEyebrowIcon size={24} />,
    },
    {
      name: 'Agendamento',
      detail: 'Em 1 Minuto',
      icon: <Calendar className="w-6 h-6 text-[#d4af37]" />,
    },
    {
      name: 'WhatsApp',
      detail: 'Direto Comigo',
      icon: <MessageCircle className="w-6 h-6 text-[#25D366]" />,
    },
  ];

  return (
    <div className="w-full py-4 my-2">
      <div className="flex items-center justify-between px-4 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Equipamentos & Diferenciais</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-medium">Padrão Rodrigo Barbeiro</span>
      </div>

      {/* Horizontal smooth scrolling bar with 3D styled matte black & gold pill-badges */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 px-4 no-scrollbar scroll-smooth">
        {tools.map((t, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 flex items-center gap-2.5 bg-[#121217] hover:bg-[#181820] border border-[#272730] hover:border-[#d4af37]/40 rounded-xl px-3.5 py-2.5 transition-all duration-300 shadow-md group cursor-default"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1c1c24] border border-[#2e2e3a] group-hover:border-[#d4af37]/60 flex items-center justify-center shadow-inner transition-colors">
              {t.icon}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-zinc-200 group-hover:text-[#f8e7b9] transition-colors leading-tight">
                {t.name}
              </p>
              <p className="text-[10px] text-zinc-400 font-normal leading-tight">
                {t.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
