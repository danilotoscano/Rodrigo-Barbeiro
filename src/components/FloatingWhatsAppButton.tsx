import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { buildDirectWhatsAppContactUrl } from '../services/bookingService';

interface FloatingWhatsAppButtonProps {
  whatsappNumber: string;
}

export function FloatingWhatsAppButton({ whatsappNumber }: FloatingWhatsAppButtonProps) {
  const [showTooltip, setShowTooltip] = useState(true);

  const url = buildDirectWhatsAppContactUrl(whatsappNumber);

  return (
    <aside aria-label="Contato direto no WhatsApp" className="fixed bottom-5 right-4 z-40 flex items-center gap-2">
      {/* Discreet speech bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-[#121218] border border-[#2b2b38] text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-2xl animate-in fade-in slide-in-from-right-3">
          <span className="text-[#25D366]">●</span>
          <span>Dúvidas? Fale com Rodrigo</span>
          <button
            onClick={() => setShowTooltip(false)}
            aria-label="Fechar dica"
            className="text-zinc-500 hover:text-zinc-300 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chamar Rodrigo no WhatsApp"
        className="relative group flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-black font-bold p-3.5 sm:px-4 sm:py-3.5 rounded-full sm:rounded-2xl shadow-2xl hover:shadow-[0_0_25px_rgba(37,211,102,0.4)] transition-all duration-300 active:scale-95"
      >
        {/* Radar ping ring */}
        <span className="absolute -inset-1 rounded-full sm:rounded-2xl bg-[#25D366]/30 animate-ping pointer-events-none"></span>

        <MessageCircle className="w-6 h-6 text-black fill-current" />
        <span className="hidden sm:inline text-xs uppercase tracking-wider font-extrabold text-black">
          Falar com Rodrigo
        </span>
      </a>
    </aside>
  );
}
