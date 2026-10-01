import React, { useState, useEffect } from 'react';
import { Calendar, MessageCircle, Sparkles, Clock, ShieldCheck, Flame, Scissors, CheckCircle, AlertCircle } from 'lucide-react';
import { buildDirectWhatsAppContactUrl } from '../services/bookingService';
import { RODRIGO_DIFFERENTIALS } from '../config/rodrigoDefaults';
import { TransparentLogo } from './TransparentLogo';

interface BiositeHeaderProps {
  customLogoUrl?: string;
  onBookNow: () => void;
  whatsappUrl: string;
}

export function BiositeHeader({ customLogoUrl, onBookNow, whatsappUrl }: BiositeHeaderProps) {
  // Real-time operating hours check (09:00 to 19:00)
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isOpenNow = currentMinutes >= 9 * 60 && currentMinutes < 19 * 60; // 09:00 to 19:00

  const directWhatsAppUrl = buildDirectWhatsAppContactUrl(whatsappUrl);
  const logoSrc = customLogoUrl || 'https://i.postimg.cc/SNHdgM96/logomarca-nova-comprimida.png';

  return (
    <header className="relative w-full pt-5 pb-6 px-4 flex flex-col items-center text-center">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-72 bg-[#d4af37]/12 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Status Bar - Centered at the top */}
      <div className="w-full max-w-md flex flex-col items-center justify-center mb-4">
        {isOpenNow ? (
          // OPEN STATUS (Green)
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-600/50 text-[11px] text-zinc-200 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-extrabold text-emerald-400 uppercase tracking-wide">Aberto Agora</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300 font-medium">Atendimento até às 19:00</span>
          </div>
        ) : (
          // CLOSED STATUS (Red centered at top as requested)
          <div className="flex flex-col items-center gap-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-600/90 text-xs text-red-200 shadow-lg shadow-red-950/60 animate-in fade-in duration-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              <span className="font-black uppercase tracking-wider text-red-400">
                FECHADO NO MOMENTO
              </span>
              <span className="text-red-700 font-bold">•</span>
              <span className="text-red-200 font-medium text-[11px]">
                Expediente: 09:00 às 19:00
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5">
              Agendamento online liberado 24h para os próximos horários
            </span>
          </div>
        )}
      </div>

      {/* Official Transparent Logo - Zero Background Guaranteed */}
      <div className="mb-4 relative group flex flex-col items-center">
        <div className="relative max-w-[210px] sm:max-w-[230px] p-2 flex items-center justify-center">
          <TransparentLogo
            src={logoSrc}
            alt="Rodrigo Barbeiro - Logo Oficial"
            className="group-hover:scale-105"
          />
        </div>
      </div>

      {/* Professional Identity - The Protagonist */}
      <div className="space-y-2 max-w-sm">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/35 text-[11px] font-bold tracking-widest text-[#f8e7b9] uppercase shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Barbeiro Profissional</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-heading">
          Rodrigo Barbeiro
        </h1>

        <p className="text-sm font-semibold text-[#e5c66e] italic tracking-wide">
          "Seu estilo começa no corte."
        </p>

        {/* Copy from User Request */}
        <div className="pt-2 text-left bg-[#111116] border border-[#242430] p-3.5 rounded-2xl shadow-inner space-y-2">
          <p className="text-xs text-zinc-200 leading-relaxed font-normal flex items-start gap-2">
            <span className="text-sm">✂️</span>
            <span>
              <strong>Especialista</strong> em cortes masculinos, degradê, barba, pintura, sobrancelha, acabamento e cuidados com o visual masculino.
            </span>
          </p>

          <p className="text-xs text-zinc-300 leading-relaxed font-normal flex items-start gap-2 pt-1 border-t border-zinc-800/80">
            <span className="text-sm">🔥</span>
            <span>
              Atendimento de qualidade, ambiente confortável e focado na <strong>autoestima masculina</strong>.
            </span>
          </p>
        </div>
      </div>

      {/* Main Primary CTA Button as requested in Section 9 */}
      <div className="w-full max-w-sm mt-5 space-y-2.5">
        <button
          onClick={onBookNow}
          className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-[#08080a] shadow-xl active:scale-[0.98] transition-all"
        >
          {/* Shimmering Gold Border */}
          <span className="absolute inset-0 bg-gradient-to-r from-[#fae7b5] via-[#d4af37] to-[#8d6b15] rounded-xl animate-pulse"></span>
          <span className="relative flex items-center justify-center gap-2.5 w-full bg-gradient-to-b from-[#f5d985] to-[#c89e24] hover:from-[#fae39d] hover:to-[#d8ad2e] text-[#0d0d12] font-black text-sm sm:text-base tracking-wide uppercase px-6 py-4 rounded-xl shadow-lg transition-all">
            <Calendar className="w-5 h-5 text-[#0d0d12]" />
            <span>AGENDAR MEU HORÁRIO</span>
          </span>
        </button>

        {/* Secondary Quick Action: Direct WhatsApp using wa.link */}
        <a
          href={directWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#131318] hover:bg-[#1a1a22] border border-[#2b2b36] hover:border-[#25D366]/50 text-zinc-200 hover:text-white text-xs font-semibold px-4 py-3 rounded-xl transition duration-200 shadow-md"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          <span>Falar com Rodrigo no WhatsApp</span>
        </a>
      </div>

      {/* Differential Checkmarks Box */}
      <div className="w-full max-w-sm mt-5 text-left bg-[#101015] border border-[#22222c] rounded-2xl p-3.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] block mb-2">
          Diferenciais do Atendimento
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
          {RODRIGO_DIFFERENTIALS.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-[11px] leading-tight font-medium text-zinc-200">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
