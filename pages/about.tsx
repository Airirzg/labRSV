import type { NextPage } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About: NextPage = () => {
  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="hero-section py-5 bg-white">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h1 className="display-4 fw-bold mb-4">
                  About Our Lab Reservation System
                </h1>
                <p className="lead mb-4">
                  Providing cutting-edge equipment and exceptional service for researchers and professionals
                  to advance their work and achieve breakthrough results.
                </p>
              </div>
              <div className="col-lg-6">
                <div className="hero-image text-center">
                  <img 
                    src="/images/about-hero.svg" 
                    alt="About Us" 
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center mb-5">
                <h2 className="display-6 fw-bold mb-4">Our Mission</h2>
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
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                  <div className="card-body p-0">
                    <div className="row g-0">
                      <div className="col-md-4 bg-primary d-flex align-items-center justify-content-center p-5" style={{ backgroundColor: '#6c5ce7' }}>
                        <i className="bi bi-bullseye text-white" style={{ fontSize: '5rem' }}></i>
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
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="features-section py-5 bg-white">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center mb-5">
                <h2 className="display-6 fw-bold mb-4">Why Choose Us?</h2>
                <p className="lead">
                  We provide an exceptional equipment reservation experience with features designed to meet your needs.
                </p>
              </div>
            </div>
            <div className="row g-4">
              <div className="col-md-6 col-lg-3">
                <div className="feature-card h-100 text-center p-4 rounded-3" style={{ 
                  backgroundColor: 'rgba(108, 92, 231, 0.05)',
                  border: '1px solid rgba(108, 92, 231, 0.1)',
                  transition: 'transform 0.3s ease',
                }}>
                  <div className="feature-icon mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundColor: '#6c5ce7',
                    color: 'white'
                  }}>
                    <i className="bi bi-check-circle-fill fs-1"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Quality Equipment</h3>
                  <p className="mb-0">
                    We maintain our equipment to the highest standards, ensuring you get the best
                    performance every time.
                  </p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="feature-card h-100 text-center p-4 rounded-3" style={{ 
                  backgroundColor: 'rgba(0, 206, 201, 0.05)',
                  border: '1px solid rgba(0, 206, 201, 0.1)',
                  transition: 'transform 0.3s ease',
                }}>
                  <div className="feature-icon mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundColor: '#00cec9',
                    color: 'white'
                  }}>
                    <i className="bi bi-clock-fill fs-1"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Flexible Rentals</h3>
                  <p className="mb-0">
                    Choose rental periods that suit your needs, from daily to monthly options.
                  </p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="feature-card h-100 text-center p-4 rounded-3" style={{ 
                  backgroundColor: 'rgba(9, 132, 227, 0.05)',
                  border: '1px solid rgba(9, 132, 227, 0.1)',
                  transition: 'transform 0.3s ease',
                }}>
                  <div className="feature-icon mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundColor: '#0984e3',
                    color: 'white'
                  }}>
                    <i className="bi bi-headset fs-1"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Expert Support</h3>
                  <p className="mb-0">
                    Our team is always ready to help you with technical questions and setup.
                  </p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="feature-card h-100 text-center p-4 rounded-3" style={{ 
                  backgroundColor: 'rgba(232, 67, 147, 0.05)',
                  border: '1px solid rgba(232, 67, 147, 0.1)',
                  transition: 'transform 0.3s ease',
                }}>
                  <div className="feature-icon mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundColor: '#e84393',
                    color: 'white'
                  }}>
                    <i className="bi bi-shield-check fs-1"></i>
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
        <section className="contact-section py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center mb-5">
                <h2 className="display-6 fw-bold mb-4">Contact Us</h2>
                <p className="lead">
                  Have questions or need assistance? We're here to help you.
                </p>
              </div>
            </div>
            <div className="row g-4 justify-content-center">
              <div className="col-md-4">
                <div className="contact-card text-center p-4 rounded-3 h-100 shadow-sm" style={{ backgroundColor: 'white' }}>
                  <div className="contact-icon mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundColor: '#6c5ce7',
                    color: 'white'
                  }}>
                    <i className="bi bi-envelope-fill fs-1"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Email Us</h3>
                  <a href="mailto:contact@reservationsystem.com" className="text-decoration-none fs-5">
                    contact@reservationsystem.com
                  </a>
                </div>
              </div>
              <div className="col-md-4">
                <div className="contact-card text-center p-4 rounded-3 h-100 shadow-sm" style={{ backgroundColor: 'white' }}>
                  <div className="contact-icon mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundColor: '#00cec9',
                    color: 'white'
                  }}>
                    <i className="bi bi-telephone-fill fs-1"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Call Us</h3>
                  <a href="tel:+15551234567" className="text-decoration-none fs-5">
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
              <div className="col-md-4">
                <div className="contact-card text-center p-4 rounded-3 h-100 shadow-sm" style={{ backgroundColor: 'white' }}>
                  <div className="contact-icon mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundColor: '#0984e3',
                    color: 'white'
                  }}>
                    <i className="bi bi-geo-alt-fill fs-1"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Visit Us</h3>
                  <p className="mb-0 fs-5">
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
    </div>
  );
};

export default About;
