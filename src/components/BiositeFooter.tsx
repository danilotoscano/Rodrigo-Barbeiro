import React from 'react';
import { Sparkles, MessageCircle, Calendar } from 'lucide-react';
import { buildDirectWhatsAppContactUrl } from '../services/bookingService';

interface BiositeFooterProps {
  whatsappNumber: string;
  onOpenSettings?: () => void;
  onBookNow: () => void;
}

export function BiositeFooter({
  whatsappNumber,
  onBookNow,
}: BiositeFooterProps) {
  const directWhatsAppUrl = buildDirectWhatsAppContactUrl(whatsappNumber);

  return (
    <footer className="w-full mt-12 pb-16 pt-8 px-4 border-t border-zinc-800/80 bg-[#09090c] text-center text-xs text-zinc-400">
      <div className="max-w-md mx-auto space-y-4">
        {/* Brand reiteration */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-zinc-200 font-bold text-sm font-heading">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Rodrigo Barbeiro</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Barbeiro Profissional • Seu estilo começa no corte.
          </p>
        </div>

        {/* Quick Footer Links */}
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-zinc-300">
          <button
            onClick={onBookNow}
            className="hover:text-[#d4af37] transition flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Agendar Horário</span>
          </button>
          <span>•</span>
          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#25D366] transition flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Legal & Professional Disclaimer */}
        <div className="pt-3 border-t border-zinc-900 text-[10px] text-zinc-400 leading-relaxed">
          <p>
            Atendimento exclusivo com hora marcada por Rodrigo Barbeiro.
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} Rodrigo Barbeiro. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
