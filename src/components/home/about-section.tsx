"use client";

import Image from 'next/image';
import { Target, Eye } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';

interface AboutSectionProps {
  firmName?: string;
  aboutContent?: string;
  mission?: string;
  vision?: string;
  photoUrls?: string[];
}

const DEFAULT_ABOUT = `Delfin Law Office is a full-service law firm based in Roxas City, Capiz, an emerging economic hub in Western Visayas. Strategically located in one of the region's growing commercial centers, the firm provides legal services that combine modern legal expertise, top-tier legal training, and a deep understanding of the local business and community landscape.

The firm's mission is to support the continued growth of local enterprises, professionals, and emerging businesses across Capiz and the broader Western Visayas region. At the same time, we provide comprehensive legal services across a wide range of practice areas, including corporate housekeeping, regulatory compliance, real estate, dispute resolution, general litigation, criminal defense, offering clients practical, strategic, and results-oriented representation.`;

const DEFAULT_MISSION = `At Delfin Law Office, our mission is to integrate legal expertise with local insight to deliver strategic, practical, and cost-effective legal solutions. Our practice is built on a strong client-first foundation, and we strive to be a trusted partner to our clients — providing sound guidance to commercial industries, offering strong and principled advocacy in litigation, and delivering legal services that are a cut above the rest.`;

const DEFAULT_VISION = `To be the law firm of choice in Western Visayas for businesses seeking to grow and build lasting enterprises, and for individuals in need of principled and effective representation in litigation. We aim to be recognized for unparalleled work ethic, sound legal counsel, and unwavering professional integrity, while contributing to the continued growth of Western Visayas as a thriving hub for commerce and enterprise.`;

export default function AboutSection({
  firmName = 'Delfin Law Office',
  aboutContent = DEFAULT_ABOUT,
  mission = DEFAULT_MISSION,
  vision = DEFAULT_VISION,
  photoUrls = [],
}: AboutSectionProps) {
  return (
    <section id="about" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Section header */}
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-sm text-muted-foreground tracking-[0.3em] uppercase mb-3">Who We Are</p>
            <h2 className="font-headline text-4xl md:text-5xl font-bold">About {firmName}</h2>
            <div className="h-[3px] w-16 bg-accent mx-auto mt-5" />
          </div>
        </FadeIn>

        {/* About text + optional photos */}
        <div className={`gap-12 md:gap-16 mb-20 ${photoUrls.length > 0 ? 'grid md:grid-cols-2 items-center' : 'max-w-3xl mx-auto'}`}>
          <FadeIn>
            <div className="space-y-5 text-muted-foreground leading-relaxed text-lg text-justify">
              {aboutContent.split('\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}
            </div>
          </FadeIn>

          {photoUrls.length > 0 && (
            <FadeIn delay={0.2}>
              <div className={`grid gap-3 ${photoUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {photoUrls.slice(0, 4).map((url, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    <Image src={url} alt={`About photo ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </FadeIn>
          )}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <FadeIn>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <Target className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-headline text-2xl md:text-3xl font-bold">Our Mission</h3>
              </div>
              <div className="text-muted-foreground leading-relaxed text-base text-justify space-y-3">
                {mission.split('\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Eye className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-headline text-2xl md:text-3xl font-bold">Our Vision</h3>
              </div>
              <div className="text-muted-foreground leading-relaxed text-base text-justify space-y-3">
                {vision.split('\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
