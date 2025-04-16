import { useRouter } from 'next/router';

const CategoriesSection = () => {
  const router = useRouter();
  const categories = [
    {
      title: 'Laboratory',
      image: '/images/categories/lab.jpg',
      description: 'Professional lab equipment for research and analysis',
      type: 'laboratory'
    },
    {
      title: 'Medical',
      image: '/images/categories/medical.jpg',
      description: 'Specialized medical and diagnostic equipment',
      type: 'medical'
    },
    {
      title: 'Research',
      image: '/images/categories/research.jpg',
      description: 'Advanced research and development tools',
      type: 'research'
    },
    {
      title: 'Testing',
      image: '/images/categories/testing.jpg',
      description: 'Quality control and testing equipment',
      type: 'testing'
    }
  ];

  const handleCategoryClick = (type: string) => {
    router.push(`/equipment?type=${type}`);
  };

  return (
    <section className="categories-section py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold mb-3">Equipment Categories</h2>
          <p className="lead text-muted">
            Browse our wide range of professional equipment categories
          </p>
        </div>

        <div className="row g-4">
          {categories.map((category, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <div 
                className="card h-100 border-0 shadow-hover cursor-pointer"
                onClick={() => handleCategoryClick(category.type)}
              >
                <img 
                  src={category.image} 
                  className="card-img-top" 
                  alt={category.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h3 className="h5 mb-2">{category.title}</h3>
                  <p className="text-muted mb-0">{category.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
