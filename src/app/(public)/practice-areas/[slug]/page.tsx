import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getPracticeAreaBySlug, getPracticeAreas } from '@/lib/supabase-data';
import { ContactModal } from '@/components/contact-modal';
import { Users, Building2, Home, HeartHandshake, Briefcase, NotebookText, Gavel, Scale, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Users, Building2, Home, HeartHandshake, Briefcase, NotebookText, Gavel, Scale,
};

export const revalidate = 60;

export async function generateStaticParams() {
  const areas = await getPracticeAreas();
  return areas.map((a) => ({ slug: a.slug }));
}

export default async function PracticeAreaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = await getPracticeAreaBySlug(slug);

  if (!area) return notFound();

  const Icon = iconMap[area.icon_name] || Briefcase;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 pt-8">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Link href="/#practice-areas">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Practice Areas
          </Link>
        </Button>
      </div>

      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-3xl">
        <div className="p-4 bg-secondary/10 rounded-2xl w-fit mb-6">
          <Icon className="h-10 w-10 text-secondary" />
        </div>

        <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">{area.name}</h1>
        <div className="h-[3px] w-16 bg-accent mt-6 mb-8" />

        <p className="text-lg text-muted-foreground leading-relaxed text-justify">{area.short_description}</p>

        {area.long_description && (
          <div
            className="mt-8 prose prose-neutral dark:prose-invert max-w-none prose-headings:font-headline prose-a:text-secondary text-justify"
            dangerouslySetInnerHTML={{ __html: area.long_description }}
          />
        )}

        <div className="mt-12">
          <ContactModal>
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg px-8 py-6">
              Get a Free Consultation
            </Button>
          </ContactModal>
        </div>
      </section>
    </div>
  );
}
