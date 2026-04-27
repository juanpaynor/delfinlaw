"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContactModal } from '@/components/contact-modal';
import { cn } from '@/lib/utils';

type HeroSlide = { id: string; image_url: string };

// Staggered letter animation for the firm name
function AnimatedWord({ word, delay = 0, className }: { word: string; delay?: number; className?: string }) {
  return (
    <span className={cn("inline-flex overflow-hidden", className)}>
      {word.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: delay + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero({ slides, backgroundUrl }: { slides?: HeroSlide[]; backgroundUrl?: string }) {
  const imageList = slides && slides.length > 0
    ? slides.map(s => s.image_url)
    : backgroundUrl ? [backgroundUrl] : [];

  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    if (imageList.length <= 1) return;
    setCurrent((prev) => (prev + 1) % imageList.length);
  }, [imageList.length]);

  const prev = () => {
    if (imageList.length <= 1) return;
    setCurrent((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  useEffect(() => {
    if (imageList.length <= 1) return;
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next, imageList.length]);

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-primary group">

      {/* ── Full-bleed background carousel ── */}
      <AnimatePresence mode="popLayout">
        {imageList.length > 0 && (
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          >
            <Image
              src={imageList[current]}
              alt={`Hero slide ${current + 1}`}
              fill
              className="object-cover"
              priority={current === 0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gradient overlays ── */}
      {/* Top vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-[1]" />
      {/* Bottom gradient — where text lives */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-[1]" />

      {/* ── Prev / Next arrows ── */}
      {imageList.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-5 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/20
                       bg-white/5 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100
                       transition-all duration-300 hover:bg-white/15"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-5 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/20
                       bg-white/5 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100
                       transition-all duration-300 hover:bg-white/15"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* ── Top-right: slide progress bar ── */}
      {imageList.length > 1 && (
        <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-2">
          <span className="text-white/50 text-xs font-mono tabular-nums tracking-widest">
            {String(current + 1).padStart(2, '0')} <span className="text-white/25">/</span> {String(imageList.length).padStart(2, '0')}
          </span>
          <div className="flex gap-1">
            {imageList.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className="relative h-[2px] w-8 bg-white/20 overflow-hidden rounded-full">
                {i === current && (
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-accent rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 7, ease: 'linear' }}
                    key={current}
                  />
                )}
                {i !== current && (
                  <div className={cn("absolute inset-0 rounded-full", i < current ? "bg-white/60" : "bg-white/20")} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom content ── */}
      <div className="absolute bottom-0 inset-x-0 z-10 px-5 pb-8 md:px-14 md:pb-12 lg:px-20">

        {/* Eyebrow */}
        <motion.p
          className="text-xs text-white/50 tracking-[0.35em] uppercase mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Law Firm · Roxas City, Capiz
        </motion.p>

        {/* Firm name */}
        <div className="flex items-end gap-3 md:gap-6 mb-3 md:mb-4">
          <h1 className="font-seasons text-[16vw] sm:text-[13vw] md:text-[11vw] lg:text-[9vw] uppercase leading-[0.85] text-white">
            <AnimatedWord word="DELFIN" delay={0.4} />
          </h1>
          {/* Vertical gold bar accent */}
          <motion.div
            className="hidden md:block w-[3px] bg-accent self-stretch mb-1"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.7, delay: 0.9, ease: [0.16, 1, 0.3, 1], transformOrigin: 'bottom' }}
          />
          <h1 className="font-seasons text-[16vw] sm:text-[13vw] md:text-[11vw] lg:text-[9vw] uppercase leading-[0.85] text-white">
            <AnimatedWord word="LAW" delay={0.6} />
          </h1>
        </div>

        {/* Divider + tagline + CTA row */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pt-4 border-t border-white/15"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <p className="text-2xl sm:text-3xl md:text-5xl font-seasons text-white/90 max-w-2xl leading-snug">
            Where Legal Expertise Meets Local Insight
          </p>
          <ContactModal>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-none
                         px-8 py-5 text-xs font-semibold tracking-[0.2em] uppercase sm:ml-auto"
            >
              Get in Touch
            </Button>
          </ContactModal>
        </motion.div>
      </div>
    </section>
  );
}


