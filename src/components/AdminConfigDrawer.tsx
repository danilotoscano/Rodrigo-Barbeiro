import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Users, 
  Calendar, 
  Database, 
  Save, 
  Check, 
  Phone, 
  Sparkles,
  ExternalLink,
  Shield,
  FileCheck
} from 'lucide-react';
import { RodrigoProfileConfig, ClientProfile, Appointment, FirebaseCustomConfig } from '../types';
import { getAllSavedClients, getAllSavedAppointments, formatPhoneMask } from '../services/bookingService';
import { getActiveFirebaseConfig, saveFirebaseConfig } from '../services/firebaseClient';

interface AdminConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: RodrigoProfileConfig;
  onSaveConfig: (updated: RodrigoProfileConfig) => void;
}

export function AdminConfigDrawer({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: AdminConfigDrawerProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'clients' | 'appointments' | 'firebase'>('profile');
  
  // Profile settings
  const [whatsappUrl, setWhatsappUrl] = useState(config.whatsappUrl || 'https://wa.link/yc9uxu');
  const [locationUrl, setLocationUrl] = useState(config.locationUrl || 'https://share.google/U3N5Myrp7S5hGsAKX');
  const [whatsappNumber, setWhatsappNumber] = useState(config.whatsappNumber);
  const [serviceLocation, setServiceLocation] = useState(config.serviceLocation || '');
  const [serviceAddress, setServiceAddress] = useState(config.serviceAddress || '');
  const [customLogoUrl, setCustomLogoUrl] = useState(config.customLogoUrl || '');
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Firebase config
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseCustomConfig>(() => {
    return (
      getActiveFirebaseConfig() || {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      }
    );
  });

  const [savedNotice, setSavedNotice] = useState(false);

  // Clients & Appointments
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (isOpen) {
      setClients(getAllSavedClients());
      setAppointments(getAllSavedAppointments());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: RodrigoProfileConfig = {
      ...config,
      whatsappUrl,
      locationUrl,
      whatsappNumber: whatsappNumber.replace(/\D/g, ''),
      whatsappDisplay: formatPhoneMask(whatsappNumber),
      serviceLocation,
      serviceAddress,
      customLogoUrl,
      customImages: customImageUrl ? [customImageUrl, ...(config.customImages || [])] : config.customImages,
    };
    onSaveConfig(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(firebaseConfig);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md h-full bg-[#0d0d12] border-l border-[#272734] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-[#121218]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#d4af37]" />
            <div>
              <h2 className="text-sm font-bold text-white font-heading">
                Painel do Rodrigo Barbeiro
              </h2>
              <p className="text-[11px] text-zinc-400">
                Ajustes rápidos, carteira de clientes e Firebase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800/80 bg-[#101016] text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 font-semibold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-[#d4af37] text-[#d4af37] bg-white/[0.02]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-3 font-semibold border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'clients'
                ? 'border-[#d4af37] text-[#d4af37] bg-white/[0.02]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Clientes</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 rounded-full">
              {clients.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-3 font-semibold border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'appointments'
                ? 'border-[#d4af37] text-[#d4af37] bg-white/[0.02]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Agenda</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 rounded-full">
              {appointments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`flex-1 py-3 font-semibold border-b-2 transition ${
              activeTab === 'firebase'
                ? 'border-[#d4af37] text-[#d4af37] bg-white/[0.02]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Firebase
          </button>
        </div>

        {/* Notification feedback */}
        {savedNotice && (
          <div className="m-3 p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Configurações atualizadas com sucesso!</span>
          </div>
        )}

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: PROFILE CONFIG */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs text-left">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  WhatsApp do Rodrigo (com DDD)
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="5511999999999"
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2.5 rounded-xl outline-none"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  Número que receberá as mensagens automáticas dos agendamentos.
                </p>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Local de Atendimento (Nome do Espaço)
                </label>
                <input
                  type="text"
                  value={serviceLocation}
                  onChange={(e) => setServiceLocation(e.target.value)}
                  placeholder="Studio & Barbearia Central • Sala 04"
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2.5 rounded-xl outline-none"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  Apresentado sempre como local onde você atende, nunca como empresa de Rodrigo.
                </p>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Endereço do Local de Atendimento
                </label>
                <input
                  type="text"
                  value={serviceAddress}
                  onChange={(e) => setServiceAddress(e.target.value)}
                  placeholder="Rua Augusta, 1200 — São Paulo, SP"
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2.5 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Link do WhatsApp Oficial (wa.link ou wa.me)
                </label>
                <input
                  type="url"
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  placeholder="https://wa.link/yc9uxu"
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2.5 rounded-xl outline-none"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  Link utilizado para direcionamento e mensagem automática do Rodrigo.
                </p>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Link da Localização (Google Maps)
                </label>
                <input
                  type="url"
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  placeholder="https://share.google/U3N5Myrp7S5hGsAKX"
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2.5 rounded-xl outline-none"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  Link direto onde os clientes abrem a rota no Google Maps.
                </p>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Link da Logo Oficial (PNG Transparente)
                </label>
                <input
                  type="url"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  placeholder="https://i.postimg.cc/5tPSF7wF/logomarca-rodrigo-sem-fundo.png"
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2.5 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Adicionar Foto na Galeria (URL)
                </label>
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2.5 rounded-xl outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#e4be4a] text-black font-bold py-3 px-4 rounded-xl transition shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Informações</span>
              </button>
            </form>
          )}

          {/* TAB 2: CLIENT PORTFOLIO (CARTEIRA DE CLIENTES DO RODRIGO) */}
          {activeTab === 'clients' && (
            <div className="space-y-3 text-left">
              <div className="p-3 rounded-xl bg-[#14141c] border border-zinc-800 text-xs">
                <span className="text-[#d4af37] font-bold">Carteira de Clientes do Rodrigo</span>
                <p className="text-zinc-400 mt-0.5 text-[11px]">
                  Base pessoal e exclusiva de clientes cadastrados pelos agendamentos.
                </p>
              </div>

              {clients.length === 0 ? (
                <div className="py-10 text-center text-xs text-zinc-400">
                  Nenhum cliente cadastrado ainda. Conforme os visitantes agendarem, seus dados e consentimentos aparecerão aqui.
                </div>
              ) : (
                clients.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-[#14141c] border border-zinc-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{c.name}</span>
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                        {c.totalAppointments} {c.totalAppointments === 1 ? 'corte' : 'cortes'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>{c.phone}</span>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-800/60">
                      <span className="flex items-center gap-1">
                        <FileCheck className={`w-3 h-3 ${c.consentCommunication ? 'text-emerald-400' : 'text-zinc-600'}`} />
                        {c.consentCommunication ? 'Aceita WhatsApp' : 'Sem consentimento'}
                      </span>
                      <span>Cadastrado em {new Date(c.firstRegisteredAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-3 text-left">
              <div className="p-3 rounded-xl bg-[#14141c] border border-zinc-800 text-xs">
                <span className="text-[#d4af37] font-bold">Agendamentos Realizados</span>
                <p className="text-zinc-400 mt-0.5 text-[11px]">
                  Horários reservados e confirmados pelos clientes.
                </p>
              </div>

              {appointments.length === 0 ? (
                <div className="py-10 text-center text-xs text-zinc-400">
                  Nenhum agendamento realizado ainda.
                </div>
              ) : (
                appointments.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl bg-[#14141c] border border-zinc-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{app.clientName}</span>
                      <span className="text-xs font-bold text-[#d4af37]">
                        R$ {app.servicePrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-300 font-medium">
                      {app.serviceName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                      <span>📅 {app.date.split('-').reverse().join('/')} às <strong className="text-emerald-400">{app.time}</strong></span>
                      <span className="text-zinc-300">{app.clientPhone}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: FIREBASE CONFIGURATION as specified in Section 32 */}
          {activeTab === 'firebase' && (
            <form onSubmit={handleSaveFirebase} className="space-y-3 text-xs text-left">
              <div className="p-3 rounded-xl bg-[#14141c] border border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#d4af37]">
                  <Database className="w-4 h-4" />
                  <span>Configuração do Firebase</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Área centralizada para integrar o seu projeto oficial do Firebase Firestore. Quando configurado, a persistência e prevenção de horários operam diretamente na nuvem!
                </p>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">API Key</label>
                <input
                  type="text"
                  value={firebaseConfig.apiKey}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2 rounded-xl outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Project ID</label>
                <input
                  type="text"
                  value={firebaseConfig.projectId}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, projectId: e.target.value })}
                  placeholder="rodrigo-barbeiro-prod"
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2 rounded-xl outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Auth Domain</label>
                <input
                  type="text"
                  value={firebaseConfig.authDomain}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, authDomain: e.target.value })}
                  placeholder="rodrigo-barbeiro-prod.firebaseapp.com"
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2 rounded-xl outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Storage Bucket</label>
                <input
                  type="text"
                  value={firebaseConfig.storageBucket}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, storageBucket: e.target.value })}
                  placeholder="rodrigo-barbeiro-prod.appspot.com"
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2 rounded-xl outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Messaging Sender ID</label>
                <input
                  type="text"
                  value={firebaseConfig.messagingSenderId}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, messagingSenderId: e.target.value })}
                  placeholder="123456789"
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2 rounded-xl outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">App ID</label>
                <input
                  type="text"
                  value={firebaseConfig.appId}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, appId: e.target.value })}
                  placeholder="1:123456789:web:abcdef"
                  className="w-full bg-[#16161e] border border-[#2b2b3a] focus:border-[#d4af37] text-white p-2 rounded-xl outline-none font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#e4be4a] text-black font-bold py-3 px-4 rounded-xl transition shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configuração Firebase</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
