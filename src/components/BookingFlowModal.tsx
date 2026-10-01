import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BarberService, TimeSlot, Appointment } from '../types';
import { 
  getAvailableTimeSlots, 
  createAppointment, 
  formatPhoneMask, 
  isValidPhone 
} from '../services/bookingService';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: BarberService[];
  initialService?: BarberService | null;
  rodrigoWhatsAppNumber: string;
  onBookingSuccess?: (appointment: Appointment) => void;
}

export function BookingFlowModal({
  isOpen,
  onClose,
  services,
  initialService,
  rodrigoWhatsAppNumber,
  onBookingSuccess,
}: BookingFlowModalProps) {
  // Steps: 1: Service, 2: Client Data, 3: Date & Time, 4: Summary, 5: Confirmed
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<BarberService | null>(
    initialService || services[0]
  );

  // Client Data
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [consentCommunication, setConsentCommunication] = useState(true);

  // Date selection
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Time slots
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [whatsAppRedirectUrl, setWhatsAppRedirectUrl] = useState<string | null>(null);

  // Update selectedService when initialService prop changes
  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
    }
  }, [initialService]);

  // Load slots whenever date changes or step becomes 3
  useEffect(() => {
    let isMounted = true;
    async function fetchSlots() {
      setIsLoadingSlots(true);
      try {
        const availableSlots = await getAvailableTimeSlots(selectedDate);
        if (isMounted) {
          setSlots(availableSlots);
          // If current selected time is no longer available, reset it
          const stillValid = availableSlots.some(s => s.time === selectedTime && s.available);
          if (!stillValid) {
            setSelectedTime('');
          }
        }
      } catch (err) {
        console.error('Error fetching time slots:', err);
      } finally {
        if (isMounted) setIsLoadingSlots(false);
      }
    }

    if (isOpen) {
      fetchSlots();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedDate, isOpen]);

  if (!isOpen) return null;

  // Generate next 14 selectable days for easy one-tap mobile booking
  const availableDates: { dateString: string; label: string; weekday: string; isToday: boolean }[] = [];
  const baseDate = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(baseDate.getDate() + i);
    const dateString = d.toISOString().split('T')[0];
    
    // Weekday name in Portuguese
    const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const label = `${dayNumber} ${monthName}`;
    
    availableDates.push({
      dateString,
      label,
      weekday: weekday.toUpperCase(),
      isToday: i === 0,
    });
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneMask(e.target.value);
    setClientPhone(formatted);
    if (errorMessage) setErrorMessage(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !clientName.trim() || !clientPhone.trim() || !selectedDate || !selectedTime) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isValidPhone(clientPhone)) {
      setErrorMessage('Por favor, insira um número de WhatsApp válido com DDD.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await createAppointment(
        {
          clientName: clientName.trim(),
          clientPhone,
          service: selectedService,
          date: selectedDate,
          time: selectedTime,
          consentCommunication,
        },
        rodrigoWhatsAppNumber
      );

      if (!res.success || !res.appointment) {
        setErrorMessage(res.errorMessage || 'Esse horário acabou de ser reservado. Escolha outro horário.');
        // Refresh slots in background
        const refreshed = await getAvailableTimeSlots(selectedDate);
        setSlots(refreshed);
        setSelectedTime('');
        setIsSubmitting(false);
        // Back to step 3 so user can pick another slot easily
        setStep(3);
        return;
      }

      // Success!
      setConfirmedAppointment(res.appointment);
      setWhatsAppRedirectUrl(res.whatsAppRedirectUrl || null);
      setStep(5);

      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#fce096', '#ffffff', '#25D366']
        });
      } catch (e) {
        // Safe fallback
      }

      if (onBookingSuccess) {
        onBookingSuccess(res.appointment);
      }
    } catch (err: any) {
      console.error('Booking failed:', err);
      setErrorMessage('Ocorreu uma falha ao registrar o agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date display (ex: "Terça-feira, 15 de Outubro")
  const formatDateDisplay = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0e0e13] border border-[#2b2b38] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#121218]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-pulse"></span>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                Agendar com Rodrigo Barbeiro
              </h2>
              <p className="text-[11px] text-zinc-400">
                {step === 5 ? 'Agendamento Confirmado' : `Etapa ${step} de 4`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar (when not in confirmation step) */}
        {step < 5 && (
          <div className="w-full bg-[#181822] h-1.5 flex">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-full transition-all duration-300 ${
                  s <= step ? 'bg-[#d4af37]' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Error Alert Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#d4af37]">
                  Passo 1
                </span>
                <h3 className="text-lg font-bold text-white">Escolha o Serviço</h3>
                <p className="text-xs text-zinc-400">Selecione o corte ou procedimento que deseja realizar.</p>
              </div>

              <div className="space-y-2 pt-2">
                {services.map((srv) => {
                  const isCurrent = selectedService?.id === srv.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setSelectedService(srv)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-[#1b1b24] border-[#d4af37] ring-1 ring-[#d4af37]'
                          : 'bg-[#131318] border-[#252530] hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{srv.name}</p>
                          {srv.badge && (
                            <span className="text-[9px] bg-[#d4af37]/20 text-[#f5deb3] font-bold px-1.5 py-0.5 rounded">
                              {srv.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{srv.description}</p>
                        <span className="text-[10px] text-zinc-400 mt-1 inline-block">
                          Duração média: {srv.durationMinutes} min
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-[#d4af37]">
                          R$ {srv.price.toFixed(2).replace('.', ',')}
                        </p>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ml-auto ${
                          isCurrent ? 'bg-[#d4af37] border-[#d4af37]' : 'border-zinc-600'
                        }`}>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-black" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!selectedService}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#e4be4a] disabled:opacity-50 text-black font-bold text-sm py-3.5 px-4 rounded-xl transition shadow-lg"
              >
                <span>Avançar para Meus Dados</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: CLIENT INFORMATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#d4af37]">
                  Passo 2
                </span>
                <h3 className="text-lg font-bold text-white">Seus Dados</h3>
                <p className="text-xs text-zinc-400">
                  Sem necessidade de criar conta ou senha. Precisamos apenas do seu nome e WhatsApp para confirmar seu horário.
                </p>
              </div>

              {/* Service chosen badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#14141c] border border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-400">Serviço:</span>{' '}
                  <span className="font-bold text-white">{selectedService?.name}</span>
                </div>
                <div className="font-bold text-[#d4af37]">
                  R$ {selectedService?.price.toFixed(2).replace('.', ',')}
                </div>
              </div>

              <div className="space-y-3">
                {/* Name Field */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Seu Nome Completo *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João Silva"
                    value={clientName}
                    onChange={(e) => {
                      setClientName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full bg-[#14141a] border border-[#2b2b38] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-white text-sm rounded-xl px-4 py-3 outline-none transition"
                  />
                </div>

                {/* WhatsApp Field */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Seu WhatsApp (com DDD) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={clientPhone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                    className="w-full bg-[#14141a] border border-[#2b2b38] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-white text-sm rounded-xl px-4 py-3 outline-none transition"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Rodrigo enviará os detalhes do corte neste número.
                  </p>
                </div>

                {/* Communication Consent as specified in section 18 */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-[#13131a] border border-[#242430] cursor-pointer hover:bg-[#181822] transition">
                    <input
                      type="checkbox"
                      checked={consentCommunication}
                      onChange={(e) => setConsentCommunication(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#d4af37] bg-zinc-900 border-zinc-700 focus:ring-[#d4af37] focus:ring-offset-0"
                    />
                    <span className="text-xs text-zinc-300 leading-snug">
                      Aceito receber lembretes de retorno, informações e novidades do Rodrigo pelo WhatsApp.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-[#1a1a22] hover:bg-[#242430] text-zinc-300 text-xs font-bold py-3.5 px-4 rounded-xl transition"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!clientName.trim()) {
                      setErrorMessage('Por favor, informe seu nome completo.');
                      return;
                    }
                    if (!isValidPhone(clientPhone)) {
                      setErrorMessage('Por favor, informe um WhatsApp válido com DDD.');
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex-[2] flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#e4be4a] text-black text-xs font-bold py-3.5 px-4 rounded-xl transition shadow-lg"
                >
                  <span>Escolher Data & Horário</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DATE & TIME SELECTION */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#d4af37]">
                  Passo 3
                </span>
                <h3 className="text-lg font-bold text-white">Data e Horário</h3>
                <p className="text-xs text-zinc-400">
                  Atendimento de 09:00 às 19:00 com intervalos de 30 min.
                </p>
              </div>

              {/* Horizontal Date Picker */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Escolha o Dia</span>
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {availableDates.map((item) => {
                    const isSelected = selectedDate === item.dateString;
                    return (
                      <button
                        key={item.dateString}
                        type="button"
                        onClick={() => {
                          setSelectedDate(item.dateString);
                          setSelectedTime('');
                          if (errorMessage) setErrorMessage(null);
                        }}
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-16 py-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#d4af37] border-[#d4af37] text-black font-bold shadow-lg scale-105'
                            : 'bg-[#14141b] border-[#292936] text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-black/80' : 'text-zinc-500'}`}>
                          {item.weekday}
                        </span>
                        <span className="text-sm font-black my-0.5">
                          {item.label.split(' ')[0]}
                        </span>
                        <span className={`text-[9px] uppercase ${isSelected ? 'text-black/90' : 'text-zinc-400'}`}>
                          {item.label.split(' ')[1]}
                        </span>
                        {item.isToday && (
                          <span className={`text-[8px] font-bold uppercase mt-1 px-1 rounded ${
                            isSelected ? 'bg-black text-[#d4af37]' : 'bg-[#d4af37]/20 text-[#f5deb3]'
                          }`}>
                            Hoje
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected date display */}
              <div className="p-2.5 rounded-xl bg-[#14141c] border border-zinc-800 text-xs text-zinc-300 text-left capitalize">
                📅 {formatDateDisplay(selectedDate)}
              </div>

              {/* Time Slots Grid */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Horários Disponíveis</span>
                  </span>
                  {isLoadingSlots && (
                    <span className="text-[10px] text-zinc-400 animate-pulse">Atualizando...</span>
                  )}
                </label>

                {isLoadingSlots ? (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    Consultando disponibilidade de horários...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#16161f] border border-zinc-800 text-center text-xs text-zinc-400">
                    Não há horários disponíveis para este dia. Por favor, selecione outra data.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                    {slots.map((slot) => {
                      const isSelected = selectedTime === slot.time;
                      const isAvailable = slot.available;

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => {
                            if (isAvailable) {
                              setSelectedTime(slot.time);
                              if (errorMessage) setErrorMessage(null);
                            }
                          }}
                          className={`py-2 px-1 text-center rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-[#d4af37] border-[#d4af37] text-black font-bold shadow-md scale-105'
                              : isAvailable
                              ? 'bg-[#15151e] border-[#292938] text-zinc-200 hover:border-[#d4af37]/60 hover:text-white'
                              : 'bg-zinc-900/40 border-zinc-900 text-zinc-600 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-[#1a1a22] hover:bg-[#242430] text-zinc-300 text-xs font-bold py-3.5 px-4 rounded-xl transition"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={!selectedTime}
                  onClick={() => setStep(4)}
                  className="flex-[2] flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#e4be4a] disabled:opacity-40 text-black text-xs font-bold py-3.5 px-4 rounded-xl transition shadow-lg"
                >
                  <span>Ver Resumo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUMMARY & CONFIRMATION as specified in Section 22 */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#d4af37]">
                  Passo 4
                </span>
                <h3 className="text-lg font-bold text-white">Seu Agendamento</h3>
                <p className="text-xs text-zinc-400">
                  Confira as informações antes de confirmar com Rodrigo.
                </p>
              </div>

              {/* Exact format required by Section 22 */}
              <div className="rounded-2xl bg-[#14141c] border border-[#2e2e3e] p-4 text-left space-y-3 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-400">Profissional:</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                    Rodrigo Barbeiro
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Cliente:</span>
                  <span className="font-bold text-zinc-100">{clientName}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">WhatsApp:</span>
                  <span className="font-bold text-zinc-100">{clientPhone}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Serviço:</span>
                  <span className="font-bold text-zinc-100">{selectedService?.name}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Valor:</span>
                  <span className="font-black text-[#d4af37] text-sm">
                    R$ {selectedService?.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Data:</span>
                  <span className="font-bold text-zinc-100 capitalize">
                    {formatDateDisplay(selectedDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-zinc-400">Horário:</span>
                  <span className="font-black text-emerald-400 text-sm bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    {selectedTime}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#161622] border border-[#2a2a38] text-[11px] text-zinc-300 text-left flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <p>
                  Ao confirmar, seu horário será garantido com exclusividade na agenda do Rodrigo e você será direcionado para o WhatsApp dele para enviar a mensagem de confirmação.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1a1a22] hover:bg-[#242430] text-zinc-300 text-xs font-bold py-3.5 px-4 rounded-xl transition"
                >
                  Alterar
                </button>

                {/* Botão Oficial: CONFIRMAR AGENDAMENTO as required in Section 22 */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-[#d4af37] to-[#aa820a] hover:from-[#e3c153] hover:to-[#be9416] text-[#0d0d12] font-black text-sm uppercase py-4 px-4 rounded-xl shadow-xl active:scale-98 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Salvando...</span>
                    </span>
                  ) : (
                    <span>CONFIRMAR AGENDAMENTO</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION SUCCESS & DIRECT WHATSAPP ACTION as specified in Section 24 */}
          {step === 5 && confirmedAppointment && (
            <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-400 shadow-xl">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">
                  Horário Garantido
                </span>
                <h3 className="text-xl font-black text-white font-heading">
                  Agendamento Realizado com Sucesso!
                </h3>
                <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                  Seu horário foi salvo na agenda de <strong className="text-white">Rodrigo Barbeiro</strong>.
                </p>
              </div>

              {/* Card with details */}
              <div className="p-4 rounded-2xl bg-[#14141c] border border-zinc-800 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Serviço:</span>
                  <span className="font-bold text-white">{confirmedAppointment.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Data & Horário:</span>
                  <span className="font-bold text-[#d4af37]">
                    {confirmedAppointment.date.split('-').reverse().join('/')} às {confirmedAppointment.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Valor:</span>
                  <span className="font-bold text-white">
                    R$ {confirmedAppointment.servicePrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* WhatsApp direct instruction as required in Section 24 */}
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-left">
                <p className="text-xs text-emerald-300 font-semibold mb-1 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  Próximo passo: Conversar com Rodrigo
                </p>
                <p className="text-[11px] text-zinc-300">
                  Clique no botão abaixo para abrir a conversa no WhatsApp com a mensagem automática já preenchida:
                </p>
                <div className="mt-2 p-2 rounded bg-black/50 border border-emerald-900/60 font-mono text-[11px] text-emerald-200 italic flex items-center justify-between gap-2">
                  <span>"Olá Rodrigo, eu agendei às {confirmedAppointment.time}, para fazer {confirmedAppointment.serviceName}."</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`Olá Rodrigo, eu agendei às ${confirmedAppointment.time}, para fazer ${confirmedAppointment.serviceName}.`);
                      alert('Mensagem copiada para a área de transferência!');
                    }}
                    className="text-[10px] bg-emerald-900/80 hover:bg-emerald-800 text-white font-sans font-bold px-2 py-1 rounded transition flex-shrink-0"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              {/* Main WhatsApp Button */}
              {whatsAppRedirectUrl && (
                <a
                  href={whatsAppRedirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-sm uppercase py-4 px-6 rounded-xl shadow-lg transition active:scale-98"
                >
                  <ExternalLink className="w-5 h-5 text-black" />
                  <span>ABRIR WHATSAPP DO RODRIGO</span>
                </a>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full text-xs font-semibold text-zinc-400 hover:text-white py-2 transition"
              >
                Concluir e fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
