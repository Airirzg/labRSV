const WhyUsSection = () => {
  const features = [
    {
      icon: 'bi-shield-check',
      title: 'Quality Assured',
      description: 'All equipment is regularly maintained and tested for optimal performance.'
    },
    {
      icon: 'bi-clock-history',
      title: 'Flexible Booking',
      description: 'Book equipment when you need it, with easy scheduling and management.'
    },
    {
      icon: 'bi-gear',
      title: 'Technical Support',
      description: 'Expert support available to help you make the most of your equipment.'
    },
    {
      icon: 'bi-cash-stack',
      title: 'Cost Effective',
      description: 'Access professional equipment without the high costs of ownership.'
    }
  ];

  return (
    <section className="why-us-section py-5 bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold mb-3">Why Choose Us</h2>
          <p className="lead text-muted">
            We provide top-quality equipment and exceptional service to support your success
          </p>
        </div>

        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className={`bi ${feature.icon} text-primary display-5 mb-3`}></i>
                  <h3 className="h4 mb-3">{feature.title}</h3>
                  <p className="text-muted mb-0">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
