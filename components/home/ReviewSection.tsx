const ReviewSection = () => {
  const reviews = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Research Scientist',
      image: '/images/reviews/review1.jpg',
      content: 'The equipment reservation system has streamlined our research process significantly. The quality of equipment and support is outstanding.',
      rating: 5
    },
    {
      name: 'Prof. Michael Chen',
      role: 'University Professor',
      image: '/images/reviews/review2.jpg',
      content: 'Excellent service and well-maintained equipment. The booking process is straightforward and efficient.',
      rating: 5
    },
    {
      name: 'Dr. Emily Brown',
      role: 'Medical Researcher',
      image: '/images/reviews/review3.jpg',
      content: 'Having access to professional equipment without the need for purchase has been invaluable for our projects.',
      rating: 4
    }
  ];

  return (
    <section className="review-section py-5 bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold mb-3">What Our Users Say</h2>
          <p className="lead text-muted">
            Trusted by professionals and researchers worldwide
          </p>
        </div>

        <div className="row g-4">
          {reviews.map((review, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <img
                      src={review.image}
                      alt={review.name}
                      className="rounded-circle me-3"
                      width="60"
                      height="60"
                      style={{ objectFit: 'cover' }}
                    />
                    <div>
                      <h3 className="h5 mb-1">{review.name}</h3>
                      <p className="text-muted small mb-0">{review.role}</p>
                    </div>
                  </div>
                  <p className="mb-3">{review.content}</p>
                  <div className="text-warning">
                    {[...Array(review.rating)].map((_, i) => (
                      <i key={i} className="bi bi-star-fill"></i>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
