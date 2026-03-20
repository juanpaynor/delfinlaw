import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Scale, Mail, Phone, GraduationCap, BookOpen } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getAttorneyBySlug, getAttorneys } from '@/lib/supabase-data';
import { ContactModal } from '@/components/contact-modal';

export const revalidate = 60;

export async function generateStaticParams() {
  const attorneys = await getAttorneys();
  return attorneys.map((a) => ({ slug: a.slug }));
}

export default async function AttorneyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const attorney = await getAttorneyBySlug(slug);

  if (!attorney) return notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <div className="container mx-auto px-4 md:px-6 pt-8">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Link href="/#attorneys">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Link>
        </Button>
      </div>

      {/* Main content */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">

          {/* Left: Portrait */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-muted">
                {attorney.photo_url ? (
                  <Image
                    src={attorney.photo_url}
                    alt={`Portrait of ${attorney.name}`}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[15vw] lg:text-[8vw] font-bold text-muted-foreground/10">
                      {attorney.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
              </div>

              {/* Contact below portrait on desktop */}
              <div className="hidden lg:block mt-6 space-y-3">
                {attorney.email && (
                  <a href={`mailto:${attorney.email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="w-4 h-4 text-secondary" />
                    {attorney.email}
                  </a>
                )}
                {attorney.phone && (
                  <a href={`tel:${attorney.phone}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="w-4 h-4 text-secondary" />
                    {attorney.phone}
                  </a>
                )}
                <ContactModal>
                  <Button className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg py-5">
                    Book a Consultation
                  </Button>
                </ContactModal>
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-3 space-y-8">
            {/* Name & Title */}
            <div>
              <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
                {attorney.name}
              </h1>
              <p className="text-secondary font-medium text-lg mt-2">{attorney.title}</p>
              <div className="h-[3px] w-16 bg-accent mt-6" />
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-2">
              {attorney.specialties.map((spec) => (
                <Badge key={spec} variant="outline" className="border-secondary/30 text-secondary px-3 py-1.5 text-sm">
                  <Scale className="w-3 h-3 mr-1.5" />
                  {spec}
                </Badge>
              ))}
            </div>

            {/* Bio */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">About</h2>
              <div className="text-foreground/80 leading-relaxed text-[17px] text-justify space-y-4">
                {attorney.bio.split('\n').map((p: string, i: number) => p.trim() ? <p key={i}>{p}</p> : null)}
              </div>
            </div>

            {/* Education */}
            {attorney.education && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Education
                </h2>
                <p className="text-foreground/80">{attorney.education}</p>
              </div>
            )}

            {/* Bar Admissions */}
            {attorney.bar_admissions && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Bar Admissions
                </h2>
                <p className="text-foreground/80">{attorney.bar_admissions}</p>
              </div>
            )}

            {/* Mobile-only contact section */}
            <div className="lg:hidden pt-4 border-t border-border space-y-3">
              {attorney.email && (
                <a href={`mailto:${attorney.email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-4 h-4 text-secondary" />
                  {attorney.email}
                </a>
              )}
              {attorney.phone && (
                <a href={`tel:${attorney.phone}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-4 h-4 text-secondary" />
                  {attorney.phone}
                </a>
              )}
              <Button asChild className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg py-5">
                <Link href="/#contact">Book a Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
