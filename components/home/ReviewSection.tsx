import { useState, useEffect, useRef } from 'react';

const ReviewSection = () => {
  const reviews = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Research Scientist',
      content: 'The equipment reservation system has streamlined our research process significantly. The quality of equipment and support is outstanding.',
      rating: 5
    },
    {
      name: 'Prof. Michael Chen',
      role: 'University Professor',
      content: 'Excellent service and well-maintained equipment. The booking process is straightforward and efficient.',
      rating: 5
    },
    {
      name: 'Dr. Emily Brown',
      role: 'Medical Researcher',
      content: 'Having access to professional equipment without the need for purchase has been invaluable for our projects.',
      rating: 4
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate visible reviews based on active index
  useEffect(() => {
    const calculateVisibleReviews = () => {
      // For simplicity, we'll show 3 reviews at a time
      const totalReviews = reviews.length;
      const indices = [];
      
      // Add the active index and the next two (wrapping around if needed)
      for (let i = 0; i < 3; i++) {
        indices.push((activeIndex + i) % totalReviews);
      }
      
      setVisibleReviews(indices);
    };
    
    calculateVisibleReviews();
  }, [activeIndex, reviews.length]);

  // Auto-slide functionality
  useEffect(() => {
    const startAutoSlide = () => {
      autoSlideTimerRef.current = setInterval(() => {
        handleNext();
      }, 5000); // Change slide every 5 seconds
    };

    startAutoSlide();

    // Cleanup on unmount
    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
    };
  }, []);

  // Pause auto-slide on user interaction
  const pauseAutoSlide = () => {
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }
  };

  // Resume auto-slide after user interaction
  const resumeAutoSlide = () => {
    pauseAutoSlide(); // Clear any existing interval
    autoSlideTimerRef.current = setInterval(() => {
      handleNext();
    }, 5000);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    pauseAutoSlide();
    
    setActiveIndex((current) => (current === 0 ? reviews.length - 1 : current - 1));
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
      resumeAutoSlide();
    }, 500);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    pauseAutoSlide();
    
    setActiveIndex((current) => (current === reviews.length - 1 ? 0 : current + 1));
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
      resumeAutoSlide();
    }, 500);
  };

  const handleIndicatorClick = (index: number) => {
    if (isTransitioning || index === activeIndex) return;
    
    setIsTransitioning(true);
    pauseAutoSlide();
    
    setActiveIndex(index);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
      resumeAutoSlide();
    }, 500);
  };

  // Generate star rating display
  const renderStars = (rating: number) => {
    return (
      <div className="d-flex justify-content-center mb-3">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="mx-1" style={{ color: i < rating ? '#FFD700' : '#D3D3D3', fontSize: '18px' }}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <section className="review-section py-5" style={{ background: '#fff' }}>
      <div className="container py-4">
        <h2 className="text-center mb-5 fw-bold" style={{ color: '#333', fontSize: '2rem' }}>
          Our Customers Love Us
        </h2>

        <div className="position-relative">
          {/* Previous button */}
          <button 
            className="position-absolute top-50 start-0 translate-middle-y bg-transparent border-0 z-1" 
            onClick={handlePrev}
            style={{ left: '-20px' }}
            aria-label="Previous review"
          >
            <span className="fs-1 text-secondary">‹</span>
          </button>

          {/* Reviews container */}
          <div className="row mx-0 overflow-hidden">
            <div 
              className="d-flex transition-container" 
              style={{ 
                transform: `translateX(0)`,
                transition: 'transform 0.5s ease-in-out',
              }}
            >
              {visibleReviews.map((index, arrayIndex) => (
                <div 
                  key={index} 
                  className="col-md-4 px-2"
                  style={{ 
                    flex: '0 0 33.333333%',
                    maxWidth: '33.333333%',
                    transition: 'opacity 0.3s ease-in-out',
                    opacity: isTransitioning ? 0.7 : 1
                  }}
                >
                  <div 
                    className="card h-100 px-4 py-4" 
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #f0f0f0',
                      boxShadow: arrayIndex === 1 
                        ? '0 12px 20px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)' 
                        : '0 6px 16px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.02)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      transform: arrayIndex === 1 ? 'translateY(-5px)' : 'translateY(0)',
                      backgroundColor: arrayIndex === 1 ? '#fcfcfc' : '#ffffff',
                      zIndex: arrayIndex === 1 ? 2 : 1
                    }}
                  >
                    {renderStars(reviews[index].rating)}
                    
                    <p 
                      className="text-center mb-4" 
                      style={{ 
                        fontSize: '0.95rem', 
                        color: '#555',
                        lineHeight: '1.6',
                        position: 'relative',
                        padding: '0 8px'
                      }}
                    >
                      <span 
                        style={{ 
                          position: 'absolute', 
                          top: '-10px', 
                          left: '0', 
                          fontSize: '28px', 
                          color: '#e0e0e0',
                          fontFamily: 'Georgia, serif'
                        }}
                      >"</span>
                      {reviews[index].content}
                      <span 
                        style={{ 
                          position: 'absolute', 
                          bottom: '-20px', 
                          right: '0', 
                          fontSize: '28px', 
                          color: '#e0e0e0',
                          fontFamily: 'Georgia, serif'
                        }}
                      >"</span>
                    </p>
                    
                    <div className="text-center mt-auto pt-2" style={{ borderTop: '1px solid #f5f5f5' }}>
                      <p className="fw-bold mb-0" style={{ color: '#333' }}>{reviews[index].name}</p>
                      <p className="small text-muted">{reviews[index].role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next button */}
          <button 
            className="position-absolute top-50 end-0 translate-middle-y bg-transparent border-0 z-1" 
            onClick={handleNext}
            style={{ right: '-20px' }}
            aria-label="Next review"
          >
            <span className="fs-1 text-secondary">›</span>
          </button>
        </div>

        {/* Indicators */}
        <div className="d-flex justify-content-center mt-4">
          {reviews.map((_, index) => (
            <button
              key={`indicator-${index}`}
              className="bg-transparent border-0 p-1"
              onClick={() => handleIndicatorClick(index)}
              aria-label={`Go to review ${index + 1}`}
            >
              <span 
                className="d-block rounded-circle" 
                style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: activeIndex === index ? '#333' : '#ccc',
                  transition: 'background-color 0.3s ease'
                }}
              ></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
