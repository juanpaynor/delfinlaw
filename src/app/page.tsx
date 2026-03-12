import Hero from "@/components/home/hero";
import PracticeAreas from "@/components/home/practice-areas";
import Testimonials from "@/components/home/testimonials";
import Attorneys from "@/components/home/attorneys";
import AiAssistantSection from "@/components/home/ai-assistant-section";
import Blog from "@/components/home/blog";

export default function Home() {
  return (
    <>
      <Hero />
      <PracticeAreas />
      <Testimonials />
      <Attorneys />
      <AiAssistantSection />
      <Blog />
    </>
  );
}
