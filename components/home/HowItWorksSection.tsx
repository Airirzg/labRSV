import React, { useState, useEffect } from 'react';

const HowItWorksSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector('.how-it-works-section');
      if (section) {
        const sectionPosition = section.getBoundingClientRect();
        const isVisible = sectionPosition.top < window.innerHeight - 100;
        setIsVisible(isVisible);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial visibility
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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

  return (
    <section className="how-it-works-section py-5">
      <div className="container py-4">
        <div className={`text-center mb-5 ${isVisible ? 'fade-in' : ''}`}>
          <p className="text-uppercase text-primary letter-spacing-2 mb-2">Simple Process</p>
          <h2 className="display-5 fw-bold mb-3">How It Works</h2>
          <div className="divider mx-auto mb-4"></div>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Get started with our equipment reservation in four simple steps
          </p>
        </div>

        <div className="process-timeline">
          <div className="timeline-line"></div>
          <div className="row justify-content-center">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`col-md-6 col-lg-3 mb-5 text-center step-item ${isVisible ? 'fade-in' : ''}`}
                style={{ animationDelay: `${index * 0.15}s` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="step-content">
                  <div 
                    className="icon-container mx-auto mb-4 d-flex align-items-center justify-content-center"
                    style={{ 
                      background: step.color,
                      boxShadow: hoveredIndex === index 
                        ? `0 12px 24px ${step.color}60, 0 6px 12px ${step.color}40` 
                        : `0 8px 16px ${step.color}40`,
                    }}
                  >
                    <i className={`bi ${step.icon} text-white`}></i>
                  </div>
                  
                  <div className="step-number">{step.number}</div>
                  
                  <h3 
                    className="fw-bold mb-2" 
                    style={{ 
                      color: hoveredIndex === index ? step.color : '#333',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-muted mb-0">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .how-it-works-section {
          position: relative;
          background-color: #f8f9fa;
          overflow: hidden;
        }
        
        .how-it-works-section::before {
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
        
        .how-it-works-section::after {
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
        
        .letter-spacing-2 {
          letter-spacing: 2px;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .divider {
          height: 3px;
          width: 60px;
          background-color: var(--bs-primary);
        }
        
        .process-timeline {
          position: relative;
          padding: 30px 0;
        }
        
        .timeline-line {
          position: absolute;
          top: 80px;
          left: 15%;
          right: 15%;
          height: 3px;
          background: linear-gradient(to right, #6c5ce7, #00cec9, #0984e3, #e84393);
          width: 70%;
          opacity: 0.3;
          z-index: 1;
        }
        
        .step-item {
          position: relative;
          z-index: 2;
        }
        
        .step-content {
          padding: 20px 15px;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .icon-container {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          position: relative;
          z-index: 3;
          transform: translateY(0);
          transition: all 0.3s ease-in-out;
        }
        
        .step-item:hover .icon-container {
          transform: translateY(-8px) scale(1.05);
          border-radius: 20px;
        }
        
        .icon-container i {
          font-size: 32px;
          transition: all 0.3s ease;
        }
        
        .step-item:hover .icon-container i {
          font-size: 36px;
        }
        
        .step-number {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 30px;
          height: 30px;
          background-color: white;
          border: 2px solid;
          border-color: inherit;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          z-index: 4;
          transition: all 0.3s ease;
        }
        
        .step-item:nth-child(1) .step-number {
          border-color: #6c5ce7;
          color: #6c5ce7;
        }
        
        .step-item:nth-child(2) .step-number {
          border-color: #00cec9;
          color: #00cec9;
        }
        
        .step-item:nth-child(3) .step-number {
          border-color: #0984e3;
          color: #0984e3;
        }
        
        .step-item:nth-child(4) .step-number {
          border-color: #e84393;
          color: #e84393;
        }
        
        .step-item h3 {
          font-size: 1.25rem;
          transition: color 0.3s ease;
        }
        
        .step-item p {
          font-size: 0.95rem;
          transition: transform 0.3s ease;
        }
        
        .step-item:hover p {
          transform: translateY(2px);
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
          .timeline-line {
            display: none;
          }
          
          .step-content {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </section>
  );
};

export default HowItWorksSection;
