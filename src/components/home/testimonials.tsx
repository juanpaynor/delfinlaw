"use client";

import { useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionHeading } from '@/components/ui/scroll-animations';
import type { DBTestimonial } from '@/lib/supabase-data';
import { useRef } from 'react';

export default function Testimonials({ items }: { items: DBTestimonial[] }) {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const next = () => setActive((prev) => (prev + 1) % items.length);
  const prev = () => setActive((prev) => (prev - 1 + items.length) % items.length);

  if (items.length === 0) return null;

  return (
    <section ref={sectionRef} id="testimonials" className="py-24 md:py-32 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading subtitle="Testimonials" title="What Our Clients Say" />

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-card rounded-2xl border border-border p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[...Array(items[active].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-accent fill-accent" />
                  ))}
                </div>
                <blockquote className="text-lg md:text-xl font-headline italic text-foreground leading-relaxed">
                  &ldquo;{items[active].quote}&rdquo;
                </blockquote>
                <div className="mt-8">
                  <p className="font-semibold text-foreground">{items[active].client_name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{items[active].case_type}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="p-2 rounded-full hover:bg-muted transition-colors">
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-400",
                    active === i ? "w-6 bg-secondary" : "w-1.5 bg-border"
                  )}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full hover:bg-muted transition-colors">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
