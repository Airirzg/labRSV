import Link from 'next/link';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFlask, FaMicroscope, FaLaptopCode } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer mt-auto py-5" style={{ backgroundColor: '#0a2540', color: '#f8f9fa' }}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h3 className="h5 mb-3 text-primary">ERL Reservation</h3>
            <p className="text-light mb-3">
              Advanced laboratory equipment reservation system for the Engineering Research Laboratory (ERL).
            </p>
            <p className="text-light mb-3">
              Streamlining access to cutting-edge equipment since 2023.
            </p>
            <div className="d-flex gap-3 mb-4">
              <a href="#" className="text-light" aria-label="Facebook">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-light" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-light" aria-label="LinkedIn">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-light" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
          
          <div className="col-6 col-lg-2">
            <h4 className="h6 mb-3 text-primary">Quick Links</h4>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/" className="text-light text-decoration-none hover-opacity">Home</Link>
              </li>
              <li className="mb-2">
                <Link href="/equipment" className="text-light text-decoration-none hover-opacity">Equipment</Link>
              </li>
              <li className="mb-2">
                <Link href="/teams" className="text-light text-decoration-none hover-opacity">Research Teams</Link>
              </li>
              <li className="mb-2">
                <Link href="/about" className="text-light text-decoration-none hover-opacity">About Us</Link>
              </li>
              <li className="mb-2">
                <Link href="/contact" className="text-light text-decoration-none hover-opacity">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-6 col-lg-2">
            <h4 className="h6 mb-3 text-primary">Equipment</h4>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/equipment?category=microscopes" className="text-light text-decoration-none hover-opacity">
                  <FaMicroscope className="me-1" /> Microscopes
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/equipment?category=analyzers" className="text-light text-decoration-none hover-opacity">
                  <FaFlask className="me-1" /> Analyzers
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/equipment?category=computers" className="text-light text-decoration-none hover-opacity">
                  <FaLaptopCode className="me-1" /> Computing
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/equipment?category=imaging" className="text-light text-decoration-none hover-opacity">
                  Imaging Equipment
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/equipment?category=all" className="text-light text-decoration-none hover-opacity">
                  View All
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-4 mt-4 mt-lg-0">
            <h4 className="h6 mb-3 text-primary">Contact Information</h4>
            <ul className="list-unstyled">
              <li className="mb-2 d-flex align-items-center">
                <FaMapMarkerAlt className="me-2 text-primary" />
                <span>123 Engineering Drive, Cambridge, MA 02142</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaPhone className="me-2 text-primary" />
                <span>+1 (617) 555-8765</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaEnvelope className="me-2 text-primary" />
                <span>support@erl-labs.edu</span>
              </li>
            </ul>
            <div className="mt-4">
              <h5 className="h6 mb-3 text-primary">Hours of Operation</h5>
              <p className="mb-1 small">Monday - Friday: 8:00 AM - 9:00 PM</p>
              <p className="mb-1 small">Saturday: 9:00 AM - 5:00 PM</p>
              <p className="mb-0 small">Sunday: Closed</p>
            </div>
          </div>
        </div>
        
        <hr className="my-4 bg-secondary" />
        
        <div className="row">
          <div className="col-md-6">
            <p className="small text-light mb-md-0">
              &copy; {currentYear} ERL - Engineering Research Laboratory. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <Link href="/privacy" className="small text-light text-decoration-none">Privacy Policy</Link>
              </li>
              <li className="list-inline-item ms-3">
                <Link href="/terms" className="small text-light text-decoration-none">Terms of Service</Link>
              </li>
              <li className="list-inline-item ms-3">
                <Link href="/faq" className="small text-light text-decoration-none">FAQ</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .hover-opacity:hover {
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }
        .text-primary {
          color: #4dabf7 !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
