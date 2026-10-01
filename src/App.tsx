/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DEFAULT_RODRIGO_CONFIG, OFFICIAL_SERVICES } from './config/rodrigoDefaults';
import { RodrigoProfileConfig, BarberService, Appointment } from './types';
import { BiositeHeader } from './components/BiositeHeader';
import { PhotoCarousel } from './components/PhotoCarousel';
import { BarberToolsShowcase } from './components/BarberToolsShowcase';
import { ServicesSection } from './components/ServicesSection';
import { LocationNotice } from './components/LocationNotice';
import { BookingFlowModal } from './components/BookingFlowModal';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { BiositeFooter } from './components/BiositeFooter';
import { AdminConfigDrawer } from './components/AdminConfigDrawer';

export default function App() {
  const [config, setConfig] = useState<RodrigoProfileConfig>(() => {
    try {
      const saved = localStorage.getItem('rodrigo_profile_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure new fields from prompt take precedence if missing or outdated
        const logo = 
          !parsed.customLogoUrl || parsed.customLogoUrl.includes('5tPSF7wF')
            ? DEFAULT_RODRIGO_CONFIG.customLogoUrl
            : parsed.customLogoUrl;
        return {
          ...DEFAULT_RODRIGO_CONFIG,
          ...parsed,
          customLogoUrl: logo,
          whatsappUrl: parsed.whatsappUrl || DEFAULT_RODRIGO_CONFIG.whatsappUrl,
          locationUrl: parsed.locationUrl || DEFAULT_RODRIGO_CONFIG.locationUrl,
          customImages: parsed.customImages && parsed.customImages.length > 0 
            ? parsed.customImages 
            : DEFAULT_RODRIGO_CONFIG.customImages,
        };
      }
    } catch (e) {
      console.warn('Could not read profile config from storage', e);
    }
    return DEFAULT_RODRIGO_CONFIG;
  });

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<BarberService | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [lastBookedNotice, setLastBookedNotice] = useState<string | null>(null);

  const handleSaveConfig = (updated: RodrigoProfileConfig) => {
    setConfig(updated);
    localStorage.setItem('rodrigo_profile_config', JSON.stringify(updated));
  };

  const handleSelectService = (service: BarberService) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleOpenGeneralBooking = () => {
    setSelectedService(OFFICIAL_SERVICES[0]); // default to Cabelo e Barba combo
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = (appointment: Appointment) => {
    setLastBookedNotice(
      `Agendamento para ${appointment.serviceName} às ${appointment.time} confirmado com Rodrigo Barbeiro!`
    );
    setTimeout(() => {
      setLastBookedNotice(null);
    }, 8000);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col items-center justify-start relative selection:bg-[#d4af37]/30 selection:text-[#f8e7b9]">
      {/* Subtle Noise / Ambient Light Gradients */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#d4af37]/15 via-transparent to-transparent pointer-events-none -z-10"></div>

      {/* Main Mobile-First Biosite Container (max-w-md provides true vertical biosite form factor) */}
      <main className="w-full max-w-md mx-auto flex flex-col items-center min-h-screen pb-12 shadow-2xl bg-[#0a0a0d] border-x border-[#181820]">
        {/* Toast Alert after booking */}
        {lastBookedNotice && (
          <div className="w-[90%] mt-3 p-3 bg-emerald-950/90 border border-emerald-600 rounded-xl text-emerald-200 text-xs text-center font-medium shadow-xl animate-in slide-in-from-top-4 duration-300">
            {lastBookedNotice}
          </div>
        )}

        {/* 1. Header with Identity, Official Logo, Differentiators & Primary CTA */}
        <BiositeHeader
          customLogoUrl={config.customLogoUrl}
          whatsappUrl={config.whatsappUrl}
          onBookNow={handleOpenGeneralBooking}
        />

        {/* 2. Photo Carousel of Rodrigo's real work with customers */}
        <PhotoCarousel
          customImages={config.customImages}
          onBookClick={handleOpenGeneralBooking}
        />

        {/* 3. 3D Elements & Tools Showcase */}
        <BarberToolsShowcase />

        {/* 4. Services List (Official Rodrigo Services) */}
        <ServicesSection
          services={OFFICIAL_SERVICES}
          selectedServiceId={selectedService?.id}
          onSelectService={handleSelectService}
          onBookNow={handleOpenGeneralBooking}
        />

        {/* 5. Location Notice (strictly presented as location where Rodrigo serves with direct Google Maps link) */}
        {config.showLocation && (
          <LocationNotice
            locationName={config.serviceLocation}
            address={config.serviceAddress}
            locationUrl={config.locationUrl}
          />
        )}

        {/* 6. Biosite Footer */}
        <BiositeFooter
          whatsappNumber={config.whatsappUrl}
          onOpenSettings={() => setIsAdminOpen(true)}
          onBookNow={handleOpenGeneralBooking}
        />
      </main>

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsAppButton whatsappNumber={config.whatsappUrl} />

      {/* Interactive Booking Flow Modal */}
      <BookingFlowModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        services={OFFICIAL_SERVICES}
        initialService={selectedService}
        rodrigoWhatsAppNumber={config.whatsappUrl}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Discreet Admin / Settings / Client Book Drawer */}
      <AdminConfigDrawer
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
