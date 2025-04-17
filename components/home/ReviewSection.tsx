import { useState, useEffect, useRef } from 'react';

const ReviewSection = () => {
  const reviews = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Research Scientist',
      content: 'The equipment reservation system has streamlined our research process significantly. The quality of equipment and support is outstanding.',
      rating: 5,
      avatar: '/images/avatars/avatar1.jpg'
    },
    {
      name: 'Prof. Michael Chen',
      role: 'University Professor',
      content: 'Excellent service and well-maintained equipment. The booking process is straightforward and efficient.',
      rating: 5,
      avatar: '/images/avatars/avatar2.jpg'
    },
    {
      name: 'Dr. Emily Brown',
      role: 'Medical Researcher',
      content: 'Having access to professional equipment without the need for purchase has been invaluable for our projects.',
      rating: 4,
      avatar: '/images/avatars/avatar3.jpg'
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [slidePosition, setSlidePosition] = useState(0);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Detect when section is visible
  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector('.review-section');
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

  // Calculate visible reviews based on active index
  useEffect(() => {
    const calculateVisibleReviews = () => {
      const totalReviews = reviews.length;
      const indices = [];
      
      // For mobile, just show the active review
      if (window.innerWidth < 768) {
        indices.push(activeIndex);
      } else {
        // For larger screens, show 3 reviews
        // Add the previous, active, and next indices (wrapping around if needed)
        const prevIndex = (activeIndex - 1 + totalReviews) % totalReviews;
        const nextIndex = (activeIndex + 1) % totalReviews;
        
        indices.push(prevIndex, activeIndex, nextIndex);
      }
      
      setVisibleReviews(indices);
    };
    
    calculateVisibleReviews();
    
    // Update slide position based on active index
    setSlidePosition(-100 * activeIndex);
    
    // Add resize listener to recalculate visible reviews
    const handleResize = () => calculateVisibleReviews();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
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
          <span key={i} className="mx-1" style={{ color: i < rating ? '#FFD700' : '#f0f0f0', fontSize: '18px' }}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <section className="review-section py-5">
      <div className="container py-4">
        <div className={`text-center mb-5 ${isVisible ? 'fade-in' : ''}`}>
          <p className="text-uppercase text-primary letter-spacing-2 mb-2">Testimonials</p>
          <h2 className="display-5 fw-bold mb-3">What Our Users Say</h2>
          <div className="divider mx-auto mb-4"></div>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Hear from researchers and professionals who use our equipment reservation system
          </p>
        </div>

        <div 
          className={`position-relative review-carousel ${isVisible ? 'fade-in' : ''}`} 
          style={{ animationDelay: '0.2s' }}
          ref={carouselRef}
        >
          {/* Previous button */}
          <button 
            className="carousel-control prev-button" 
            onClick={handlePrev}
            aria-label="Previous review"
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          {/* Reviews */}
          <div className="carousel-container">
            <div className="carousel-track">
              {reviews.map((review, index) => (
                <div 
                  key={index} 
                  className={`review-card-wrapper ${activeIndex === index ? 'active' : ''}`}
                  style={{
                    transform: `translateX(${index === activeIndex ? 0 : index < activeIndex ? -100 : 100}%)`,
                    opacity: activeIndex === index ? 1 : 0.4,
                    zIndex: activeIndex === index ? 2 : 1
                  }}
                >
                  <div className="review-card">
                    <div className="quote-mark quote-top">"</div>
                    
                    {renderStars(review.rating)}
                    
                    <p className="review-content">
                      {review.content}
                    </p>
                    
                    <div className="reviewer-info">
                      <div className="avatar-container">
                        <div className="avatar" style={{ backgroundImage: `url(${review.avatar})` }}></div>
                      </div>
                      <div>
                        <p className="reviewer-name">{review.name}</p>
                        <p className="reviewer-role">{review.role}</p>
                      </div>
                    </div>
                    
                    <div className="quote-mark quote-bottom">"</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next button */}
          <button 
            className="carousel-control next-button" 
            onClick={handleNext}
            aria-label="Next review"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        {/* Indicators */}
        <div className="indicators-container">
          {reviews.map((_, index) => (
            <button
              key={`indicator-${index}`}
              className={`indicator ${activeIndex === index ? 'active' : ''}`}
              onClick={() => handleIndicatorClick(index)}
              aria-label={`Go to review ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .review-section {
          position: relative;
          background-color: #fff;
          overflow: hidden;
        }
        
        .review-section::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(13, 110, 253, 0.05) 0%, rgba(13, 110, 253, 0) 70%);
          border-radius: 50%;
          top: -100px;
          left: -100px;
          z-index: 0;
        }
        
        .review-section::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(13, 110, 253, 0.05) 0%, rgba(13, 110, 253, 0) 70%);
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
        
        .review-carousel {
          padding: 30px 50px;
          position: relative;
        }
        
        .carousel-container {
          overflow: hidden;
          padding: 20px 0;
          position: relative;
        }
        
        .carousel-track {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 350px;
          position: relative;
        }
        
        .carousel-control {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: white;
          border: none;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .carousel-control:hover {
          background-color: var(--bs-primary);
          color: white;
        }
        
        .prev-button {
          left: 0;
        }
        
        .next-button {
          right: 0;
        }
        
        .carousel-control i {
          font-size: 1.2rem;
        }
        
        .review-card-wrapper {
          position: absolute;
          width: 100%;
          max-width: 500px;
          padding: 15px;
          transition: all 0.5s ease;
          transform: translateX(0);
        }
        
        .review-card {
          background-color: white;
          border-radius: 16px;
          padding: 30px 25px;
          height: 100%;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          position: relative;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          border: 1px solid #f0f0f0;
        }
        
        .active .review-card {
          box-shadow: 0 15px 40px rgba(0,0,0,0.12);
          transform: translateY(-5px);
        }
        
        .review-content {
          font-size: 0.95rem;
          color: #555;
          line-height: 1.6;
          margin-bottom: 20px;
          flex-grow: 1;
          position: relative;
          z-index: 1;
          text-align: center;
        }
        
        .quote-mark {
          font-family: Georgia, serif;
          font-size: 60px;
          line-height: 1;
          color: #f0f0f0;
          position: absolute;
          z-index: 0;
        }
        
        .quote-top {
          top: 10px;
          left: 15px;
        }
        
        .quote-bottom {
          bottom: 10px;
          right: 15px;
        }
        
        .reviewer-info {
          display: flex;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid #f5f5f5;
          position: relative;
          z-index: 1;
        }
        
        .avatar-container {
          margin-right: 15px;
        }
        
        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          border: 3px solid white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.1);
        }
        
        .reviewer-name {
          font-weight: 600;
          margin-bottom: 0;
          color: #333;
          font-size: 1rem;
        }
        
        .reviewer-role {
          color: #888;
          font-size: 0.85rem;
          margin-bottom: 0;
        }
        
        .indicators-container {
          display: flex;
          justify-content: center;
          margin-top: 30px;
        }
        
        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ccc;
          margin: 0 5px;
          padding: 0;
          border: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .indicator.active {
          background-color: var(--bs-primary);
          transform: scale(1.3);
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
        
        @media (max-width: 768px) {
          .review-carousel {
            padding: 20px 40px;
          }
          
          .review-card-wrapper {
            max-width: 90%;
          }
        }
      `}</style>
    </section>
  );
};

export default ReviewSection;
