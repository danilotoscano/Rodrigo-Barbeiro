import React from 'react';
import { BarberService } from '../types';
import { 
  GoldScissorsIcon, 
  GoldRazorIcon, 
  GoldClipperIcon, 
  GoldColorBrushIcon, 
  GoldEyebrowIcon, 
  GoldHairComboIcon 
} from './Gold3DIcons';
import { Calendar, Clock, ChevronRight, Sparkles } from 'lucide-react';

interface ServicesSectionProps {
  services: BarberService[];
  onSelectService: (service: BarberService) => void;
  selectedServiceId?: string;
  onBookNow: () => void;
}

export function ServicesSection({
  services,
  onSelectService,
  selectedServiceId,
  onBookNow,
}: ServicesSectionProps) {
  const renderIcon = (iconName: BarberService['iconName']) => {
    switch (iconName) {
      case 'combo':
        return <GoldHairComboIcon size={30} />;
      case 'scissors':
        return <GoldScissorsIcon size={28} />;
      case 'razor':
        return <GoldRazorIcon size={28} />;
      case 'color':
        return <GoldColorBrushIcon size={28} />;
      case 'eyebrow':
        return <GoldEyebrowIcon size={28} />;
      default:
        return <GoldClipperIcon size={28} />;
    }
  };

  return (
    <section className="w-full my-6 px-4">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 text-[10px] font-bold tracking-widest text-[#f5deb3] uppercase mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Tabela Oficial</span>
        </div>
        <h2 className="text-2xl font-black text-white font-heading">
          Serviços do Rodrigo
        </h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs">
          Escolha o procedimento desejado para agendar seu atendimento exclusivo.
        </p>
      </div>

      {/* Services List */}
      <div className="space-y-3 max-w-md mx-auto">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id;
          const isFeatured = service.id === 'cabelo-e-barba';

          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer text-left border ${
                isSelected
                  ? 'bg-[#181820] border-[#d4af37] ring-1 ring-[#d4af37] shadow-xl'
                  : isFeatured
                  ? 'bg-gradient-to-br from-[#16161c] to-[#121217] border-[#d4af37]/40 hover:border-[#d4af37]/70'
                  : 'bg-[#121216] border-[#252530] hover:border-[#383848] hover:bg-[#16161d]'
              }`}
            >
              {/* Featured Ribbon */}
              {isFeatured && (
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-[#d4af37] to-[#aa820a] text-black text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                  Mais Escolhido
                </div>
              )}

              <div className="flex items-start gap-3.5">
                {/* 3D Icon medallion */}
                <div className="w-12 h-12 rounded-xl bg-[#1a1a24] border border-[#2e2e3e] flex items-center justify-center flex-shrink-0 shadow-inner">
                  {renderIcon(service.iconName)}
                </div>

                {/* Service Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base font-bold text-zinc-100 truncate font-heading">
                      {service.name}
                    </h3>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs text-[#d4af37] font-medium mr-0.5">R$</span>
                      <span className="text-lg font-black text-white">
                        {service.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/60">
                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {service.durationMinutes} minutos
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectService(service);
                      }}
                      className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-[#d4af37] text-black shadow-md'
                          : 'bg-[#20202a] text-zinc-200 hover:text-white hover:bg-[#2b2b38]'
                      }`}
                    >
                      <span>{isSelected ? 'Selecionado' : 'Agendar'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary CTA Button as explicitly outlined in section 33 */}
      <div className="max-w-md mx-auto mt-6">
        <button
          onClick={onBookNow}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#d4af37] to-[#aa820a] hover:from-[#e3c153] hover:to-[#be9416] text-[#0d0d12] font-black text-sm uppercase py-3.5 px-6 rounded-xl shadow-lg active:scale-98 transition"
        >
          <Calendar className="w-4 h-4 text-[#0d0d12]" />
          <span>AGENDAR MEU HORÁRIO</span>
        </button>
      </div>
    </section>
  );
}
