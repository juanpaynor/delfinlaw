import Hero from "@/components/home/hero";
import PracticeAreas from "@/components/home/practice-areas";
import Testimonials from "@/components/home/testimonials";
import Attorneys from "@/components/home/attorneys";
import Blog from "@/components/home/blog";

export default function Home() {
  return (
    <>
      <Hero />
      <PracticeAreas />
      <Testimonials />
      <Attorneys />
      <Blog />
    </>
  );
}
