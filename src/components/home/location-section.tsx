"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { MapPin, ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LocationSectionProps {
  locationContent?: string;
  slides?: { id: string; image_url: string }[];
  address?: string;
  phone?: string;
  mobile?: string;
  email?: string;
}

const DEFAULT_LOCATION = `Our office is located in Plantanan Park, a vibrant space at the heart of Roxas City that brings together business, art, and community.

Situated within a well-established district, our location provides convenient access to our clients and reflects our commitment to staying rooted in community while remaining part of the city's dynamic and growing urban landscape.`;

function LocationCarousel({ slides }: { slides: { id: string; image_url: string }[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), [slides.length]);
  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-0 group">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <Image
            src={slides[current].image_url}
            alt={`Location photo ${current + 1}`}
            fill
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle dark gradient on left edge to blend with text panel */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />

      {/* Prev / Next */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Counter */}
      <div className="absolute bottom-5 right-5 z-20 bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
        {current + 1} / {slides.length}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function LocationSection({
  locationContent = DEFAULT_LOCATION,
  slides = [],
  address,
  phone,
  mobile,
  email,
}: LocationSectionProps) {
  return (
    <section id="location" className="overflow-hidden">
      <div className={cn('flex flex-col', slides.length > 0 ? 'md:flex-row md:min-h-[600px]' : '')}>

        {/* Left — dark text panel */}
        <div className="bg-primary text-primary-foreground flex items-center md:w-[45%] shrink-0">
          <div className="px-8 py-16 md:px-12 md:py-20 lg:px-16 max-w-xl w-full mx-auto md:mx-0 md:ml-auto">
            {/* Label */}
            <p className="text-xs text-primary-foreground/50 tracking-[0.3em] uppercase mb-4">Find Us</p>

            {/* Heading */}
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-2 leading-tight">Our Location</h2>
            <div className="h-[3px] w-12 bg-accent mb-8" />

            {/* Sub-heading */}
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="h-4 w-4 text-accent shrink-0" />
              <span className="font-semibold text-sm tracking-wide">Plantanan Park, Roxas City</span>
            </div>

            {/* Body */}
            <div className="space-y-4 text-primary-foreground/75 leading-relaxed text-[15px] text-justify mb-8">
              {locationContent.split('\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}
            </div>

            {/* Address + contact details */}
            <div className="border-t border-primary-foreground/20 pt-6 space-y-3 text-sm">
              {address && (
                <div className="flex items-start gap-3 text-primary-foreground/70">
                  <MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                  <span>{address}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-3 text-primary-foreground/70">
                  <Phone className="h-4 w-4 text-accent shrink-0" />
                  <span>
                    <span className="text-primary-foreground/50 text-xs mr-1">Tel:</span>
                    <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="hover:text-white transition-colors">{phone}</a>
                    {mobile && (
                      <><span className="mx-2 text-primary-foreground/30">|</span>
                      <span className="text-primary-foreground/50 text-xs mr-1">Mobile:</span>
                      {mobile}</>
                    )}
                  </span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-3 text-primary-foreground/70">
                  <Mail className="h-4 w-4 text-accent shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — full-bleed carousel */}
        {slides.length > 0 && (
          <div className="flex-1 relative">
            <LocationCarousel slides={slides} />
          </div>
        )}
      </div>
    </section>
  );
}
