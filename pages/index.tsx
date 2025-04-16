import type { NextPage } from 'next';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import WhyUsSection from '@/components/home/WhyUsSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import ReviewSection from '@/components/home/ReviewSection';

const Home: NextPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      
      <main>
        <HeroSection />
        <WhyUsSection />
        <CategoriesSection />
        <HowItWorksSection />
        <ReviewSection />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
