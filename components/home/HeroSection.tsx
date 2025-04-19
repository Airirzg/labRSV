import { useRouter } from 'next/router';
import Image from 'next/image';

const HeroSection = () => {
  const router = useRouter();

  return (
    <section 
      className="hero-section py-5" 
      style={{
        backgroundImage: 'url("/images/hero/background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        marginTop: '-100px',
        paddingTop: '180px'
      }}
    >
      {/* Dark overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 0
        }}
      ></div>
      
      <div className="container" style={{ position: 'relative', zIndex: 1, minHeight: '510px' }}>
        <div className="row align-items-center" style={{ marginTop: '95px' }}>
          <div className="col-lg-8 col-md-10 mx-auto mx-lg-0">
            <h1 className="display-3 fw-bold mb-4 text-white">
              Reserve Professional Equipment with Ease
            </h1>
            <p className="lead mb-4 text-white" style={{ fontSize: '1.3rem' }}>
              Access high-quality equipment for your research, projects, and professional needs. 
              Book online and focus on what matters most - your work.
            </p>
            <div className="d-flex gap-3" style={{ marginTop: '100px' }}>
              <button 
                onClick={() => router.push('/equipment')}
                className="btn btn-primary btn-lg px-4 py-3"
              >
                Browse Equipment
              </button>
              <button 
                onClick={() => router.push('/about')}
                className="btn btn-outline-light btn-lg px-4 py-3"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
