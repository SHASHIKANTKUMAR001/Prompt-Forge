import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { HowItWorks } from '@/components/HowItWorks';
import { FeaturedProjects } from '@/components/FeaturedProjects';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedProjects />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
