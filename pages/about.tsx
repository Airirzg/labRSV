import type { NextPage } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About: NextPage = () => {
  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      
      <main className="container py-4">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <h1 className="text-center mb-5">About Us</h1>
            
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="h4 mb-4">Our Mission</h2>
                <p>
                  We are dedicated to providing high-quality equipment rental services to professionals
                  and enthusiasts alike. Our mission is to make professional-grade equipment accessible
                  to everyone who needs it, while ensuring the highest standards of service and support.
                </p>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="h4 mb-4">Why Choose Us?</h2>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                      <div>
                        <h3 className="h6 mb-2">Quality Equipment</h3>
                        <p className="small text-muted">
                          We maintain our equipment to the highest standards, ensuring you get the best
                          performance every time.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-clock-fill text-success me-2 mt-1"></i>
                      <div>
                        <h3 className="h6 mb-2">Flexible Rentals</h3>
                        <p className="small text-muted">
                          Choose rental periods that suit your needs, from daily to monthly options.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-headset text-success me-2 mt-1"></i>
                      <div>
                        <h3 className="h6 mb-2">Expert Support</h3>
                        <p className="small text-muted">
                          Our team is always ready to help you with technical questions and setup.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-shield-check text-success me-2 mt-1"></i>
                      <div>
                        <h3 className="h6 mb-2">Insurance Coverage</h3>
                        <p className="small text-muted">
                          All rentals include basic insurance coverage for your peace of mind.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h4 mb-4">Contact Us</h2>
                <div className="row g-3">
                  <div className="col-md-6">
                    <p className="mb-1">
                      <i className="bi bi-envelope me-2"></i>
                      Email:
                    </p>
                    <p className="text-primary">contact@reservationsystem.com</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1">
                      <i className="bi bi-telephone me-2"></i>
                      Phone:
                    </p>
                    <p className="text-primary">+1 (555) 123-4567</p>
                  </div>
                  <div className="col-12">
                    <p className="mb-1">
                      <i className="bi bi-geo-alt me-2"></i>
                      Address:
                    </p>
                    <p className="text-primary mb-0">
                      123 Equipment Street<br />
                      San Francisco, CA 94105
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
