"use client";

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ScrollReveal, SectionHeading } from '@/components/ui/scroll-animations';
import type { DBPracticeArea } from '@/lib/supabase-data';
import { Users, Building2, Home, HeartHandshake, Briefcase, NotebookText, Gavel, LucideIcon, Scale } from 'lucide-react';

// Map icon_name from DB to Lucide icon components
const iconMap: Record<string, LucideIcon> = {
  Users, Building2, Home, HeartHandshake, Briefcase, NotebookText, Gavel, Scale,
};

function FlipTiltCard({ area, index }: { area: DBPracticeArea; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => { x.set(0.5); y.set(0.5); setIsFlipped(false); };
  const Icon = iconMap[area.icon_name] || Briefcase;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsFlipped(true)}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className="relative h-[240px] cursor-pointer"
    >
      {/* Front */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-card border border-border p-6 flex flex-col items-center justify-center text-center"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
      >
        <div className="p-3 bg-muted rounded-xl mb-4">
          <Icon className="h-8 w-8 text-secondary" />
        </div>
        <h3 className="font-headline text-lg font-bold">{area.name}</h3>
      </motion.div>

      {/* Back */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-secondary text-secondary-foreground p-6 flex flex-col justify-between"
        animate={{ rotateY: isFlipped ? 0 : -180 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Icon className="h-5 w-5 text-accent" />
            <h3 className="font-headline text-base font-bold">{area.name}</h3>
          </div>
          <p className="text-sm leading-relaxed opacity-90 text-justify">{area.short_description}</p>
        </div>
        <Link href={`/practice-areas/${area.slug}`} className="text-accent text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all mt-3">
          Learn more →
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function PracticeAreas({ items }: { items: DBPracticeArea[] }) {
  return (
    <section id="practice-areas" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading
          subtitle="What We Do"
          title="Our Practice Areas"
          description="Hover to learn more about our comprehensive legal services."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((area, i) => (
            <ScrollReveal key={area.id} effect="fade-up" delay={i * 0.04}>
              <FlipTiltCard area={area} index={i} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
