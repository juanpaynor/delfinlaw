"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { ContactModal } from '@/components/contact-modal';

// Deterministic pseudo-random to avoid SSR hydration mismatch
function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// Pre-compute dots at module level — rounded to avoid hydration float mismatch
const r = (n: number) => Math.round(n * 100) / 100;
const dots = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: r(seededRandom(i * 3) * 100),
  y: r(seededRandom(i * 3 + 1) * 100),
  size: r(3 + seededRandom(i * 3 + 2) * 5),
  duration: r(15 + seededRandom(i * 7) * 20),
  delay: r(seededRandom(i * 11) * 10),
}));

function FloatingDots() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-white/10"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(d.id) * 20, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: d.duration, repeat: Infinity, delay: d.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function Hero({ backgroundUrl }: { backgroundUrl?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x1 = useSpring(useTransform(mouseX, [-500, 500], [-12, 12]), { stiffness: 50, damping: 20 });
  const y1 = useSpring(useTransform(mouseY, [-300, 300], [-6, 6]), { stiffness: 50, damping: 20 });
  const x2 = useSpring(useTransform(mouseX, [-500, 500], [8, -8]), { stiffness: 50, damping: 20 });
  const y2 = useSpring(useTransform(mouseY, [-300, 300], [4, -4]), { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX - window.innerWidth / 2);
    mouseY.set(e.clientY - window.innerHeight / 2);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-primary" onMouseMove={handleMouseMove}>
      {/* Background Image */}
      {backgroundUrl && (
        <Image
          src={backgroundUrl}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-[1]" />

      <FloatingDots />

      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-4">
        {/* Subtitle */}
        <motion.p
          className="text-sm text-white/60 tracking-[0.3em] uppercase mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Advocates for Justice & Growth
        </motion.p>

        {/* DELFIN */}
        <motion.h1
          className="font-headline font-black text-[16vw] md:text-[12vw] uppercase leading-[0.85] text-white select-none"
          style={{ x: x1, y: y1 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          DELFIN
        </motion.h1>

        {/* Clean divider line */}
        <motion.div
          className="h-[2px] bg-accent my-3"
          initial={{ width: 0 }}
          animate={{ width: "30vw" }}
          transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.4, 0.25, 1] as const }}
        />

        {/* LAW */}
        <motion.h1
          className="font-headline font-black text-[20vw] md:text-[14vw] uppercase leading-[0.85] text-white select-none"
          style={{ x: x2, y: y2 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          LAW
        </motion.h1>

        {/* CTA */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <ContactModal>
            <Button size="lg" className="bg-white hover:bg-white/90 text-primary rounded-lg px-8 py-6 text-base font-semibold">
              Get in Touch
            </Button>
          </ContactModal>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{ opacity: { delay: 2 }, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
      >
        <ArrowDown className="w-4 h-4 text-white/50" />
      </motion.div>
    </section>
  );
}
