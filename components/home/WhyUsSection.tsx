import React from 'react';

const WhyUsSection = () => {
  const features = [
    {
      icon: 'bi-shield-check',
      title: 'Quality Assured',
      description: 'All equipment is regularly maintained and tested for optimal performance.',
      number: '01'
    },
    {
      icon: 'bi-clock-history',
      title: 'Flexible Booking',
      description: 'Book equipment when you need it, with easy scheduling and management.',
      number: '02'
    },
    {
      icon: 'bi-gear',
      title: 'Technical Support',
      description: 'Expert support available to help you make the most of your equipment.',
      number: '03'
    },
    {
      icon: 'bi-cash-stack',
      title: 'Cost Effective',
      description: 'Access professional equipment without the high costs of ownership.',
      number: '04'
    }
  ];

  return (
    <section className="why-us-section py-5">
      <div className="container py-5">
        <div className="text-center mb-5">
          <p className="text-uppercase text-primary letter-spacing-2 mb-2">Why Choose Us</p>
          <h2 className="display-4 fw-bold mb-4">Why Choose Us</h2>
          <div className="divider mx-auto"></div>
        </div>

        <div className="row g-5 mt-3">
          {features.map((feature, index) => (
            <div key={index} className="col-md-6">
              <div className="feature-item d-flex p-4">
                <div className="feature-number me-4">
                  <span>{feature.number}</span>
                </div>
                <div className="feature-icon me-4">
                  <div className="icon-container">
                    <i className={`bi ${feature.icon}`}></i>
                  </div>
                </div>
                <div className="feature-content">
                  <h3 className="h4 mb-3">{feature.title}</h3>
                  <p className="text-muted">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .why-us-section {
          background-color: #f8f9fa;
          position: relative;
          overflow: hidden;
        }
        
        .why-us-section::before {
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
        
        .why-us-section::after {
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
        
        .container {
          position: relative;
          z-index: 1;
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
        
        .feature-item {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .feature-item:hover {
          transform: translateY(-5px);
        }
        
        .feature-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #dee2e6;
          line-height: 1;
          opacity: 0.8;
        }
        
        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--bs-primary), #0b5ed7);
          color: white;
          font-size: 1.5rem;
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
          transition: all 0.3s ease;
        }
        
        .feature-item:hover .icon-container {
          transform: scale(1.1);
        }
        
        .feature-content {
          flex: 1;
        }
        
        .feature-content h3 {
          font-weight: 600;
          transition: color 0.3s ease;
        }
        
        .feature-item:hover .feature-content h3 {
          color: var(--bs-primary);
        }
        
        @media (max-width: 768px) {
          .feature-item {
            flex-direction: column;
          }
          
          .feature-number, .feature-icon {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default WhyUsSection;
