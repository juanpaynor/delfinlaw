import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getSiteSettings, getHomepageSections } from '@/lib/supabase-data';

export const revalidate = 60;

// Maps section_key from DB → nav label + href
const SECTION_NAV_MAP: Record<string, { name: string; href: string }> = {
  about:          { name: 'About',          href: '#about' },
  practice_areas: { name: 'Practice Areas', href: '#practice-areas' },
  testimonials:   { name: 'Testimonials',   href: '#testimonials' },
  attorneys:      { name: 'Our Lawyers',    href: '#attorneys' },
  blog:           { name: 'Blog',           href: '#blog' },
  location:       { name: 'Location',       href: '#location' },
  contact:        { name: 'Contact',        href: '#contact' },
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, sections] = await Promise.all([
    getSiteSettings(),
    getHomepageSections(),
  ]);

  // These are injected at fixed positions regardless of DB
  const alwaysFirst = ['about'];
  const alwaysLast  = ['location', 'contact'];
  const alwaysShow  = [...alwaysFirst, ...alwaysLast];

  const navLinks = [
    SECTION_NAV_MAP['about'],
    // DB-driven visible sections (excludes pinned ones)
    ...sections
      .filter(s => s.is_visible && !alwaysShow.includes(s.section_key) && SECTION_NAV_MAP[s.section_key])
      .map(s => SECTION_NAV_MAP[s.section_key]),
    SECTION_NAV_MAP['location'],
    SECTION_NAV_MAP['contact'],
  ].filter(Boolean) as { name: string; href: string }[];

  return (
    <>
      <Header logoUrl={settings.logo_url || undefined} navLinks={navLinks} />
      <main>{children}</main>
      <Footer settings={settings} />
      <Toaster />
    </>
  );
}
