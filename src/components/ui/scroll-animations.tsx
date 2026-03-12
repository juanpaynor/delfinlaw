"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ScrollReveal: wraps a child in a scroll-linked cinematic entrance.
 * As the element scrolls into view, it fades in + transforms based on the chosen `effect`.
 */
export function ScrollReveal({
  children,
  className,
  effect = 'fade-up',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  effect?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'rotate-in';
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end 0.8"],
  });

  const progress = useTransform(scrollYProgress, [0, 0.4 + delay, 1], [0, 0, 1]);

  const opacity = useTransform(progress, [0, 1], [0, 1]);

  const transforms: Record<string, Record<string, ReturnType<typeof useTransform>>> = {
    'fade-up': {
      y: useTransform(progress, [0, 1], [80, 0]),
    },
    'fade-left': {
      x: useTransform(progress, [0, 1], [-80, 0]),
    },
    'fade-right': {
      x: useTransform(progress, [0, 1], [80, 0]),
    },
    'scale': {
      scale: useTransform(progress, [0, 1], [0.8, 1]),
    },
    'rotate-in': {
      rotateY: useTransform(progress, [0, 1], [30, 0]),
      scale: useTransform(progress, [0, 1], [0.9, 1]),
    },
  };

  return (
    <motion.div
      ref={ref}
      style={{ opacity, ...transforms[effect] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollDivider: A gold line that draws itself as you scroll into it.
 */
export function ScrollDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end 0.8"],
  });

  const scaleX = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <div ref={ref} className="py-8 flex justify-center">
      <motion.div
        className="h-[2px] w-32 bg-gradient-to-r from-transparent via-accent to-transparent origin-center"
        style={{ scaleX, opacity }}
      />
    </div>
  );
}

/**
 * ParallaxLayer: Creates a parallax effect tied to scroll.
 * Children move at a different speed than the page.
 */
export function ParallaxLayer({
  children,
  className,
  speed = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}px`, `${speed * 100}px`]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * ScrollProgress: A thin gold progress bar at the very top of the viewport
 * that fills as you scroll down the page.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-accent z-[60] origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

/**
 * SectionHeading: Animated section heading with scroll-linked subtitle,
 * title, and gold underline reveal.
 */
export function SectionHeading({
  subtitle,
  title,
  description,
}: {
  subtitle: string;
  title: string;
  description?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const subtitleOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const lineWidth = useTransform(scrollYProgress, [0.3, 0.8], [0, 80]);
  const descOpacity = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);

  return (
    <div ref={ref} className="text-center mb-16">
      <motion.span
        className="text-accent font-semibold text-sm uppercase tracking-[0.2em] mb-4 block"
        style={{ opacity: subtitleOpacity }}
      >
        {subtitle}
      </motion.span>
      <motion.h2
        className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-secondary"
        style={{ y: titleY, opacity: titleOpacity }}
      >
        {title}
      </motion.h2>
      <div className="flex justify-center mt-6">
        <motion.div
          className="h-[3px] bg-accent"
          style={{ width: lineWidth }}
        />
      </div>
      {description && (
        <motion.p
          className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          style={{ opacity: descOpacity }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
