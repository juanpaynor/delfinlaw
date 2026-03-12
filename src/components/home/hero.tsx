import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import allImages from '@/lib/placeholder-images.json';

export default function Hero() {
  const heroImage = allImages.placeholderImages.find(img => img.id === 'hero');

  return (
    <section className="relative h-[80vh] min-h-[500px] w-full flex items-center justify-center text-center text-white">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          data-ai-hint={heroImage.imageHint}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/80" />
      <div className="relative z-10 p-4 flex flex-col items-center">
        <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight max-w-4xl">
          Your Advocates for Justice and Growth
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-2xl text-slate-300">
          Delfin Law combines decades of experience with a modern, client-focused approach to deliver exceptional legal outcomes.
        </p>
        <div className="mt-10">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 rounded-full shadow-lg transition-transform duration-300 hover:scale-105">
            <Link href="#practice-areas">Explore Our Expertise</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
