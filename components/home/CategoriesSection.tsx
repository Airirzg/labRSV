import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const CategoriesSection = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector('.categories-section');
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
  
  const categories = [
    {
      title: 'Telecommunications',
      image: '/images/hero/equipment/telecommunications.webp',
      description: 'Advanced research in network technologies, signal processing, and wireless communications systems',
      type: 'telecommunications'
    },
    {
      title: 'Cloud Computing & AI',
      image: '/images/hero/equipment/cloud-ai.webp',
      description: 'Cutting-edge research in machine learning, data analytics, and distributed computing systems',
      type: 'cloud-ai'
    },
    {
      title: 'Multi-Sector Automation',
      image: '/images/hero/equipment/multi-sector.webp',
      description: 'Electronic control systems and automation solutions across various industry sectors',
      type: 'multi-sector'
    },
    {
      title: 'Systems Engineering',
      image: '/images/hero/equipment/systems-engineering.jpg',
      description: 'Industrial computing and automation for complex engineering systems and processes',
      type: 'systems-engineering'
    }
  ];

  const handleCategoryClick = (type: string) => {
    router.push(`/equipment?type=${type}`);
  };

  return (
    <section className="categories-section py-5">
      <div className="container py-4">
        <div className={`text-center mb-5 ${isVisible ? 'fade-in' : ''}`}>
          <p className="text-uppercase text-primary letter-spacing-2 mb-2">Our Expertise</p>
          <h2 className="display-5 fw-bold mb-3">Research Teams</h2>
          <div className="divider mx-auto mb-4"></div>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Explore our specialized research teams and their cutting-edge equipment
          </p>
        </div>

        <div className="row g-4">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className={`col-md-6 col-lg-3 category-item ${isVisible ? 'fade-in' : ''}`} 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className="card h-100 border-0 shadow-hover cursor-pointer"
                onClick={() => handleCategoryClick(category.type)}
              >
                <div className="card-img-container">
                  <div className="category-number">{index + 1}</div>
                  <img 
                    src={category.image} 
                    className="card-img-top" 
                    alt={category.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                  <div className="img-overlay"></div>
                </div>
                <div className="card-body">
                  <h3 className="h5 mb-2">{category.title}</h3>
                  <p className="text-muted mb-0">{category.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .categories-section {
          position: relative;
          background-color: #f8f9fa;
          overflow: hidden;
        }
        
        .categories-section::before {
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
        
        .categories-section::after {
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
        }
        
        .shadow-hover {
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border-radius: 12px;
          overflow: hidden;
        }
        
        .shadow-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        .card-img-container {
          height: 200px;
          overflow: hidden;
          position: relative;
        }
        
        .card-img-container img {
          height: 100%;
          width: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .shadow-hover:hover .card-img-container img {
          transform: scale(1.05);
        }
        
        .img-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4));
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }
        
        .shadow-hover:hover .img-overlay {
          opacity: 0.7;
        }
        
        .category-number {
          position: absolute;
          top: 15px;
          left: 15px;
          width: 30px;
          height: 30px;
          background-color: var(--bs-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          z-index: 2;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .card-body {
          padding: 1.5rem;
          position: relative;
        }
        
        .card-body h3 {
          font-weight: 600;
          transition: color 0.3s ease;
        }
        
        .shadow-hover:hover .card-body h3 {
          color: var(--bs-primary);
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
        
        .category-item {
          opacity: 0;
          transform: translateY(20px);
        }
        
        .category-item.fade-in {
          animation: fadeIn 0.8s forwards;
        }
        
        @media (max-width: 768px) {
          .category-number {
            width: 25px;
            height: 25px;
            font-size: 0.8rem;
          }
          
          .card-body {
            padding: 1.2rem;
          }
        }
      `}</style>
    </section>
  );
};

export default CategoriesSection;
