import { getSiteSettings } from '@/lib/supabase-data';
import { Target, Eye } from 'lucide-react';
import { ContactModal } from '@/components/contact-modal';
import { Button } from '@/components/ui/button';

export const revalidate = 60;

export default async function AboutPage() {
  const settings = await getSiteSettings();

  const firmName = settings.firm_name || 'Delfin Law Advocates';
  const mission = settings.mission || 'To provide exceptional, client-centered legal services that empower individuals and businesses to navigate complex legal challenges with confidence and clarity.';
  const vision = settings.vision || 'To be the most trusted and respected law firm in the region, recognized for our unwavering commitment to justice, innovation in legal practice, and the lasting impact we create for our clients and communities.';
  const firmHistory = settings.firm_history || '';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
          <p className="text-sm text-primary-foreground/60 tracking-[0.3em] uppercase mb-4">Who We Are</p>
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold">About {firmName}</h1>
          <div className="h-[3px] w-16 bg-accent mx-auto mt-6" />
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Mission */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <Target className="h-6 w-6 text-secondary" />
                </div>
                <h2 className="font-headline text-2xl md:text-3xl font-bold">Our Mission</h2>
              </div>
              <div className="text-muted-foreground leading-relaxed text-lg text-justify space-y-4">
                {mission.split('\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}
              </div>
            </div>

            {/* Vision */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Eye className="h-6 w-6 text-accent" />
                </div>
                <h2 className="font-headline text-2xl md:text-3xl font-bold">Our Vision</h2>
              </div>
              <div className="text-muted-foreground leading-relaxed text-lg text-justify space-y-4">
                {vision.split('\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Firm History (if set) */}
      {firmHistory && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-10">Our Story</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-headline prose-a:text-secondary text-lg text-justify">
              {firmHistory.split('\n').map((paragraph, i) => (
                paragraph.trim() ? <p key={i}>{paragraph}</p> : null
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
          <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">Ready to Work Together?</h2>
          <p className="text-primary-foreground/70 text-lg mb-8">
            Let us put our experience and values to work for you.
          </p>
          <ContactModal>
            <Button size="lg" className="bg-white hover:bg-white/90 text-primary rounded-lg px-8 py-6 text-base font-semibold">
              Get in Touch
            </Button>
          </ContactModal>
        </div>
      </section>
    </div>
  );
}
