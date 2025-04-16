import React, { useState } from 'react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '1',
      title: 'Browse Equipment',
      description: 'Explore our extensive catalog of professional equipment',
      icon: 'bi-search',
      color: '#6c5ce7'
    },
    {
      number: '2',
      title: 'Make Reservation',
      description: 'Select your dates and submit your reservation request',
      icon: 'bi-calendar-check',
      color: '#00cec9'
    },
    {
      number: '3',
      title: 'Get Approved',
      description: 'Receive confirmation and access details',
      icon: 'bi-check-circle',
      color: '#0984e3'
    },
    {
      number: '4',
      title: 'Start Using',
      description: 'Pick up or receive your equipment and begin your work',
      icon: 'bi-play-circle',
      color: '#e84393'
    }
  ];

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="how-it-works-section py-5" style={{ background: '#f8f9fa' }}>
      <div className="container py-4">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold mb-3">How it works?</h2>
          <p className="lead text-muted">
            Get started in four simple steps
          </p>
        </div>

        <div className="row justify-content-center">
          {/* Steps with icons */}
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="col-md-6 col-lg-3 mb-5 text-center"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className="icon-container mx-auto mb-4 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: hoveredIndex === index ? '16px' : '12px', 
                  background: step.color,
                  boxShadow: hoveredIndex === index 
                    ? `0 12px 24px ${step.color}60, 0 6px 12px ${step.color}40` 
                    : `0 8px 16px ${step.color}40`,
                  position: 'relative',
                  zIndex: 3,
                  transform: hoveredIndex === index ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)',
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                <i 
                  className={`bi ${step.icon} text-white`} 
                  style={{ 
                    fontSize: hoveredIndex === index ? '36px' : '32px',
                    transition: 'font-size 0.3s ease'
                  }}
                ></i>
              </div>
              
              <h3 
                className="fw-bold mb-2" 
                style={{ 
                  fontSize: '1.25rem',
                  color: hoveredIndex === index ? step.color : '#333',
                  transition: 'color 0.3s ease'
                }}
              >
                {step.title}
              </h3>
              <p 
                className="text-muted mb-0" 
                style={{ 
                  fontSize: '0.95rem',
                  transform: hoveredIndex === index ? 'translateY(2px)' : 'translateY(0)',
                  transition: 'transform 0.3s ease'
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
