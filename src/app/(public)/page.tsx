import Hero from "@/components/home/hero";
import PracticeAreas from "@/components/home/practice-areas";
import Testimonials from "@/components/home/testimonials";
import Attorneys from "@/components/home/attorneys";
import Blog from "@/components/home/blog";
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
      <PracticeAreas items={practiceAreas} />
      <Testimonials items={testimonials} />
      <Attorneys items={attorneys} />
      <Blog items={blogPosts} />
    </>
  );
}
