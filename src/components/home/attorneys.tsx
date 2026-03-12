"use client";

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeading, ScrollReveal } from '@/components/ui/scroll-animations';
import type { DBAttorney } from '@/lib/supabase-data';

function AttorneyCard({ attorney, index }: { attorney: DBAttorney; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [4, -4]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-4, 4]), { stiffness: 200, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => { mouseX.set(0.5); mouseY.set(0.5); };

  return (
    <Link href={`/attorneys/${attorney.slug}`}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative cursor-pointer h-full"
      >
        <div className="relative h-full bg-card rounded-2xl overflow-hidden border border-border hover:border-secondary/30 transition-all duration-300 hover:shadow-lg">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            {attorney.photo_url ? (
              <Image
                src={attorney.photo_url}
                alt={`Portrait of ${attorney.name}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold text-muted-foreground/20">
                  {attorney.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="font-headline text-xl font-bold text-white">{attorney.name}</h3>
              <p className="text-white/70 text-sm mt-0.5">{attorney.title}</p>
              
              <div className="flex flex-wrap gap-1.5 mt-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                {attorney.specialties.map(spec => (
                  <Badge key={spec} className="bg-white/15 backdrop-blur text-white border-0 text-xs">{spec}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">View Profile</span>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Attorneys({ items }: { items: DBAttorney[] }) {
  if (items.length === 0) return null;

  return (
    <section id="attorneys" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading
          subtitle="Our Team"
          title="Meet Your Advocates"
          description="A dedicated team of experienced legal professionals."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((attorney, i) => (
            <ScrollReveal key={attorney.id} effect="fade-up" delay={i * 0.05}>
              <AttorneyCard attorney={attorney} index={i} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
