import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { VenueSlider } from '@/components/home/VenueSlider';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { StatsSection } from '@/components/home/StatsSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { GallerySection } from '@/components/home/GallerySection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <VenueSlider />
      <FeaturesSection />
      <StatsSection />
      <HowItWorks />
      <GallerySection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
