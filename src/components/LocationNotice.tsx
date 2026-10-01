import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Check, Copy } from 'lucide-react';

interface LocationNoticeProps {
  locationName?: string;
  address?: string;
  locationUrl?: string;
}

export function LocationNotice({
  locationName = 'Espaço parceiro de atendimento',
  address = 'Atendimento exclusivo com hora marcada',
  locationUrl = 'https://share.google/U3N5Myrp7S5hGsAKX',
}: LocationNoticeProps) {
  const [copied, setCopied] = useState(false);

  const handleOpenMaps = () => {
    window.open(locationUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(locationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full my-6 px-4" aria-label="Local de Atendimento">
      <div className="max-w-md mx-auto rounded-2xl bg-[#121217] border border-[#262632] p-5 shadow-xl relative overflow-hidden">
        {/* Subtle top gold accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>

        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#1b1b24] border border-[#2f2f3e] flex items-center justify-center flex-shrink-0 text-[#d4af37] shadow-inner">
            <MapPin className="w-5 h-5 text-[#d4af37]" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <span className="text-[10px] font-bold tracking-widest text-[#d4af37] uppercase">
              Onde eu atendo
            </span>
            <h3 className="text-base font-bold text-white mt-0.5 font-heading">
              Local de Atendimento
            </h3>
            
            <p className="text-xs text-zinc-300 font-medium mt-1">
              Atendo no espaço parceiro com estrutura completa para seu conforto.
            </p>

            <p className="text-[11px] text-zinc-400 mt-1 italic leading-relaxed">
              * Atendimento individual e exclusivo por <strong>Rodrigo Barbeiro</strong> com hora marcada.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-zinc-800/80">
              <a
                href={locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-black bg-[#d4af37] hover:bg-[#e4be4a] px-3.5 py-2 rounded-xl transition shadow-md active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-black" />
                <span>Abrir Rota no Google Maps</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-[#16161e] hover:bg-[#1f1f2a] border border-zinc-800 px-3 py-2 rounded-xl transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Link Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
