import Hero from "@/components/home/hero";
import PracticeAreas from "@/components/home/practice-areas";
import Testimonials from "@/components/home/testimonials";
import Attorneys from "@/components/home/attorneys";
import Blog from "@/components/home/blog";
import AboutSection from "@/components/home/about-section";
import LocationSection from "@/components/home/location-section";
import { ScrollProgress } from "@/components/ui/scroll-animations";
import {
  getPracticeAreas,
  getAttorneys,
  getTestimonials,
  getBlogPosts,
  getSiteSettings,
  getHeroSlides,
} from "@/lib/supabase-data";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const [practiceAreas, attorneys, testimonials, blogPosts, settings, heroSlides] = await Promise.all([
    getPracticeAreas(),
    getAttorneys(),
    getTestimonials(),
    getBlogPosts(),
    getSiteSettings(),
    getHeroSlides(),
  ]);

  return (
    <>
      <ScrollProgress />
      <Hero slides={heroSlides} backgroundUrl={settings.hero_image_url} />
      <AboutSection
        firmName={settings.firm_name || undefined}
        aboutContent={settings.about_content || undefined}
        mission={settings.mission || undefined}
        vision={settings.vision || undefined}
        photoUrls={settings.about_photo_urls ? JSON.parse(settings.about_photo_urls) : []}
      />
      <PracticeAreas items={practiceAreas} />
      <Testimonials items={testimonials} />
      <Attorneys items={attorneys} />
      <Blog items={blogPosts} />
      <LocationSection
        locationContent={settings.location_content || undefined}
        slides={heroSlides}
        address={settings.address_line1 || undefined}
        phone={settings.phone || undefined}
        mobile={settings.mobile || undefined}
        email={settings.email || undefined}
      />
    </>
  );
}
