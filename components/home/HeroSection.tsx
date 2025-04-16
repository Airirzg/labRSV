import { useRouter } from 'next/router';

const HeroSection = () => {
  const router = useRouter();

  return (
    <section className="hero-section py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="display-4 fw-bold mb-4">
              Reserve Professional Equipment with Ease
            </h1>
            <p className="lead mb-4">
              Access high-quality equipment for your research, projects, and professional needs. 
              Book online and focus on what matters most - your work.
            </p>
            <div className="d-flex gap-3">
              <button 
                onClick={() => router.push('/equipment')}
                className="btn btn-primary btn-lg"
              >
                Browse Equipment
              </button>
              <button 
                onClick={() => router.push('/about')}
                className="btn btn-outline-primary btn-lg"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="hero-image">
              <img 
                src="/images/hero-equipment.svg" 
                alt="Professional Equipment" 
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
