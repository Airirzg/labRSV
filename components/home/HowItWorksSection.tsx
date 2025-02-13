const HowItWorksSection = () => {
  const steps = [
    {
      number: '1',
      title: 'Browse Equipment',
      description: 'Explore our extensive catalog of professional equipment',
      icon: 'bi-search'
    },
    {
      number: '2',
      title: 'Make Reservation',
      description: 'Select your dates and submit your reservation request',
      icon: 'bi-calendar-check'
    },
    {
      number: '3',
      title: 'Get Approved',
      description: 'Receive confirmation and access details',
      icon: 'bi-check-circle'
    },
    {
      number: '4',
      title: 'Start Using',
      description: 'Pick up or receive your equipment and begin your work',
      icon: 'bi-play-circle'
    }
  ];

  return (
    <section className="how-it-works-section py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold mb-3">How It Works</h2>
          <p className="lead text-muted">
            Get started in four simple steps
          </p>
        </div>

        <div className="row">
          {steps.map((step, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <div className="text-center position-relative mb-4">
                <div className="step-number">
                  <span className="h1 fw-bold text-primary">{step.number}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="step-connector d-none d-lg-block"></div>
                )}
              </div>
              <div className="text-center">
                <i className={`bi ${step.icon} text-primary display-5 mb-3`}></i>
                <h3 className="h4 mb-3">{step.title}</h3>
                <p className="text-muted">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
