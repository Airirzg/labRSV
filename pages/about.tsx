import type { NextPage } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';

const About: NextPage = () => {
  const [isVisible, setIsVisible] = useState({
    mission: false,
    features: false,
    contact: false
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['mission', 'features', 'contact'];
      
      sections.forEach(section => {
        const element = document.querySelector(`.${section}-section`);
        if (element) {
          const position = element.getBoundingClientRect();
          if (position.top < window.innerHeight - 100) {
            setIsVisible(prev => ({ ...prev, [section]: true }));
          }
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial visibility
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="hero-section py-5">
          <div className="hero-background">
            <div className="overlay"></div>
          </div>
          <div className="container position-relative py-5">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="hero-content text-white">
                  <h1 className="display-4 fw-bold mb-4 text-shadow">
                    About Our Lab Reservation System
                  </h1>
                  <p className="lead mb-4 text-shadow">
                    Providing cutting-edge equipment and exceptional service for researchers and professionals
                    to advance their work and achieve breakthrough results.
                  </p>
                  <div className="mt-4">
                    <a href="#mission" className="btn btn-primary btn-lg px-4 me-3">Our Mission</a>
                    <a href="#contact" className="btn btn-outline-light btn-lg px-4">Contact Us</a>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 d-none d-lg-block">
                <div className="hero-image text-center">
                  <img 
                    src="/images/hero/aboutus.png" 
                    alt="About Us" 
                    className="img-fluid floating-animation"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="mission-section py-5">
          <div className="container py-5">
            <div className={`row justify-content-center ${isVisible.mission ? 'fade-in' : ''}`}>
              <div className="col-lg-8 text-center mb-5">
                <p className="text-uppercase text-primary letter-spacing-2 mb-2">Our Purpose</p>
                <h2 className="display-5 fw-bold mb-3">Our Mission</h2>
                <div className="divider mx-auto mb-4"></div>
                <div className="row justify-content-center">
                  <div className="col-md-10">
                    <p className="lead">
                      We are dedicated to providing high-quality equipment rental services to professionals
                      and enthusiasts alike. Our mission is to make professional-grade equipment accessible
                      to everyone who needs it, while ensuring the highest standards of service and support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={`row justify-content-center ${isVisible.mission ? 'fade-in' : ''}`} style={{ animationDelay: '0.2s' }}>
              <div className="col-lg-10">
                <div className="mission-card">
                  <div className="row g-0">
                    <div className="col-md-4 mission-icon-container d-flex align-items-center justify-content-center p-5">
                      <i className="bi bi-bullseye mission-icon"></i>
                    </div>
                    <div className="col-md-8">
                      <div className="p-5">
                        <h3 className="h3 fw-bold mb-4">What Drives Us</h3>
                        <p className="mb-4">
                          Our team is passionate about providing researchers and professionals with the tools they need to succeed.
                          We believe that access to high-quality equipment should never be a barrier to innovation and discovery.
                        </p>
                        <p className="mb-0">
                          Every day, we work to make the equipment reservation process simpler, more efficient, and more reliable
                          for our users, allowing them to focus on what truly matters - their groundbreaking work.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section id="features" className="features-section py-5">
          <div className="container py-5">
            <div className={`row justify-content-center ${isVisible.features ? 'fade-in' : ''}`}>
              <div className="col-lg-8 text-center mb-5">
                <p className="text-uppercase text-primary letter-spacing-2 mb-2">Our Advantages</p>
                <h2 className="display-5 fw-bold mb-3">Why Choose Us?</h2>
                <div className="divider mx-auto mb-4"></div>
                <p className="lead mx-auto" style={{ maxWidth: '700px' }}>
                  We offer a comprehensive equipment reservation solution with features designed to make your experience seamless and productive.
                </p>
              </div>
            </div>
            <div className="row g-4">
              <div className={`col-md-6 col-lg-3 ${isVisible.features ? 'fade-in' : ''}`} style={{ animationDelay: '0.1s' }}>
                <div className="feature-card">
                  <div className="feature-icon-container">
                    <i className="bi bi-laptop feature-icon"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">User-Friendly Platform</h3>
                  <p className="mb-0">
                    Our intuitive interface makes it easy to browse, reserve, and manage equipment.
                  </p>
                </div>
              </div>
              <div className={`col-md-6 col-lg-3 ${isVisible.features ? 'fade-in' : ''}`} style={{ animationDelay: '0.2s' }}>
                <div className="feature-card">
                  <div className="feature-icon-container" style={{ backgroundColor: '#00cec9' }}>
                    <i className="bi bi-clock-history feature-icon"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Flexible Scheduling</h3>
                  <p className="mb-0">
                    Book equipment for the exact time periods you need with our flexible scheduling system.
                  </p>
                </div>
              </div>
              <div className={`col-md-6 col-lg-3 ${isVisible.features ? 'fade-in' : ''}`} style={{ animationDelay: '0.3s' }}>
                <div className="feature-card">
                  <div className="feature-icon-container" style={{ backgroundColor: '#0984e3' }}>
                    <i className="bi bi-gear feature-icon"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Technical Support</h3>
                  <p className="mb-0">
                    Our expert team is always available to provide assistance with equipment usage.
                  </p>
                </div>
              </div>
              <div className={`col-md-6 col-lg-3 ${isVisible.features ? 'fade-in' : ''}`} style={{ animationDelay: '0.4s' }}>
                <div className="feature-card">
                  <div className="feature-icon-container" style={{ backgroundColor: '#e84393' }}>
                    <i className="bi bi-shield-check feature-icon"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Insurance Coverage</h3>
                  <p className="mb-0">
                    All rentals include basic insurance coverage for your peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact-section py-5">
          <div className="container py-5">
            <div className={`row justify-content-center ${isVisible.contact ? 'fade-in' : ''}`}>
              <div className="col-lg-8 text-center mb-5">
                <p className="text-uppercase text-primary letter-spacing-2 mb-2">Get In Touch</p>
                <h2 className="display-5 fw-bold mb-3">Contact Us</h2>
                <div className="divider mx-auto mb-4"></div>
                <p className="lead mx-auto" style={{ maxWidth: '700px' }}>
                  Have questions or need assistance? We're here to help you with any inquiries about our equipment reservation system.
                </p>
              </div>
            </div>
            <div className="row g-4 justify-content-center">
              <div className={`col-md-4 ${isVisible.contact ? 'fade-in' : ''}`} style={{ animationDelay: '0.1s' }}>
                <div className="contact-card">
                  <div className="contact-icon-container" style={{ backgroundColor: '#6c5ce7' }}>
                    <i className="bi bi-envelope-fill contact-icon"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Email Us</h3>
                  <a href="mailto:contact@reservationsystem.com" className="contact-link">
                    contact@reservationsystem.com
                  </a>
                </div>
              </div>
              <div className={`col-md-4 ${isVisible.contact ? 'fade-in' : ''}`} style={{ animationDelay: '0.2s' }}>
                <div className="contact-card">
                  <div className="contact-icon-container" style={{ backgroundColor: '#00cec9' }}>
                    <i className="bi bi-telephone-fill contact-icon"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Call Us</h3>
                  <a href="tel:+15551234567" className="contact-link">
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
              <div className={`col-md-4 ${isVisible.contact ? 'fade-in' : ''}`} style={{ animationDelay: '0.3s' }}>
                <div className="contact-card">
                  <div className="contact-icon-container" style={{ backgroundColor: '#0984e3' }}>
                    <i className="bi bi-geo-alt-fill contact-icon"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Visit Us</h3>
                  <p className="mb-0 contact-text">
                    123 Equipment Street<br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .hero-section {
          position: relative;
          padding: 80px 0;
          overflow: hidden;
        }
        
        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/images/hero/equipment/telecommunications.webp');
          background-size: cover;
          background-position: center;
          z-index: 0;
        }
        
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7));
          z-index: 1;
        }
        
        .container {
          position: relative;
          z-index: 2;
        }
        
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        .letter-spacing-2 {
          letter-spacing: 2px;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .divider {
          height: 3px;
          width: 60px;
          background-color: var(--bs-primary);
          margin-bottom: 30px;
        }
        
        .mission-section {
          background-color: #f8f9fa;
          position: relative;
          overflow: hidden;
        }
        
        .mission-section::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(13, 110, 253, 0.1) 0%, rgba(13, 110, 253, 0) 70%);
          border-radius: 50%;
          top: -100px;
          left: -100px;
          z-index: 0;
        }
        
        .mission-card {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 15px 30px rgba(0,0,0,0.1);
          background-color: white;
          transition: all 0.3s ease;
        }
        
        .mission-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .mission-icon-container {
          background-color: #6c5ce7;
          color: white;
        }
        
        .mission-icon {
          font-size: 5rem;
          transition: all 0.3s ease;
        }
        
        .mission-card:hover .mission-icon {
          transform: scale(1.1);
        }
        
        .features-section {
          background-color: white;
          position: relative;
        }
        
        .feature-card {
          padding: 30px 25px;
          border-radius: 16px;
          background-color: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          height: 100%;
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
          position: relative;
          overflow: hidden;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 5px;
          background-color: #6c5ce7;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.12);
        }
        
        .feature-card:hover::before {
          opacity: 1;
        }
        
        .feature-icon-container {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          background-color: #6c5ce7;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(108, 92, 231, 0.3);
        }
        
        .feature-card:hover .feature-icon-container {
          transform: scale(1.1);
          border-radius: 20px;
        }
        
        .feature-icon {
          font-size: 2rem;
          transition: all 0.3s ease;
        }
        
        .feature-card:hover .feature-icon {
          transform: rotate(10deg);
        }
        
        .contact-section {
          background-color: #f8f9fa;
          position: relative;
          overflow: hidden;
        }
        
        .contact-section::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(13, 110, 253, 0.1) 0%, rgba(13, 110, 253, 0) 70%);
          border-radius: 50%;
          bottom: -100px;
          right: -100px;
          z-index: 0;
        }
        
        .contact-card {
          text-align: center;
          padding: 30px 25px;
          border-radius: 16px;
          background-color: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          height: 100%;
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
        }
        
        .contact-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.12);
        }
        
        .contact-icon-container {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #6c5ce7;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .contact-card:hover .contact-icon-container {
          transform: scale(1.1);
        }
        
        .contact-icon {
          font-size: 2rem;
        }
        
        .contact-link {
          color: #6c5ce7;
          text-decoration: none;
          font-size: 1.1rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .contact-link:hover {
          color: #5649c0;
        }
        
        .contact-text {
          font-size: 1.1rem;
          color: #555;
        }
        
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeIn 0.8s forwards;
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 992px) {
          .hero-section {
            padding: 60px 0;
          }
          
          .hero-content {
            text-align: center;
            margin-bottom: 40px;
          }
        }
        
        @media (max-width: 768px) {
          .mission-icon-container {
            padding: 3rem !important;
          }
          
          .mission-icon {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default About;
