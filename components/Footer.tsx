import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h3 className="h5 mb-3">Equipment Reservation System</h3>
            <p className="text-muted mb-0">
              Professional equipment rental and reservation platform for researchers,
              medical professionals, and industry experts.
            </p>
          </div>
          
          <div className="col-6 col-lg-2">
            <h4 className="h6 mb-3">Quick Links</h4>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/" className="text-muted text-decoration-none">Home</Link>
              </li>
              <li className="mb-2">
                <Link href="/equipment" className="text-muted text-decoration-none">Equipment</Link>
              </li>
              <li className="mb-2">
                <Link href="/about" className="text-muted text-decoration-none">About Us</Link>
              </li>
              <li className="mb-2">
                <Link href="/contact" className="text-muted text-decoration-none">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-6 col-lg-2">
            <h4 className="h6 mb-3">Categories</h4>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/equipment?type=laboratory" className="text-muted text-decoration-none">Laboratory</Link>
              </li>
              <li className="mb-2">
                <Link href="/equipment?type=medical" className="text-muted text-decoration-none">Medical</Link>
              </li>
              <li className="mb-2">
                <Link href="/equipment?type=research" className="text-muted text-decoration-none">Research</Link>
              </li>
              <li className="mb-2">
                <Link href="/equipment?type=testing" className="text-muted text-decoration-none">Testing</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-4">
            <h4 className="h6 mb-3">Contact Us</h4>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                123 Research Park, Silicon Valley, CA
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                contact@equipmentreservation.com
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                +1 (555) 123-4567
              </li>
            </ul>
            <div className="social-links mt-3">
              <a href="#" className="text-muted me-3">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-muted me-3">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-muted me-3">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        
        <hr className="my-4 bg-secondary" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="text-muted mb-0">
              © {new Date().getFullYear()} Equipment Reservation System. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <Link href="/privacy" className="text-muted text-decoration-none">Privacy Policy</Link>
              </li>
              <li className="list-inline-item ms-3">
                <Link href="/terms" className="text-muted text-decoration-none">Terms of Use</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
