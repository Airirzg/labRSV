import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import logoImage from '@/src/assets/images/logos/ERLRSV-Logo.png';
import { useEffect, useState } from 'react';

interface NavbarProps {
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout: handleLogout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const isHomePage = router.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navbarClass = isHomePage 
    ? `navbar navbar-expand-lg ${scrolled ? 'navbar-light bg-white shadow-sm' : 'navbar-dark'} fixed-top`
    : 'navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top';

  return (
    <>
      <nav className={navbarClass}>
        <div className="container">
          <Link href="/" className="navbar-brand d-flex align-items-center">
            <Image 
              src={logoImage} 
              alt="ERLRSV Logo" 
              width={100} 
              height={100} 
              className="me-1"
              priority
            />
          </Link>
          
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <Link href="/" className={`nav-link ${router.pathname === '/' ? 'active' : ''}`}>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/equipment" className={`nav-link ${router.pathname === '/equipment' ? 'active' : ''}`}>
                  Equipment
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/about" className={`nav-link ${router.pathname === '/about' ? 'active' : ''}`}>
                  About Us
                </Link>
              </li>
              {user?.role === 'ADMIN' && (
                <li className="nav-item">
                  <Link href="/admin/dashboard" className={`nav-link ${router.pathname.startsWith('/admin') ? 'active' : ''}`}>
                    Admin
                  </Link>
                </li>
              )}
            </ul>
            
            <ul className="navbar-nav">
              {user ? (
                <>
                  <li className="nav-item">
                    <Link href="/dashboard/profile" className={`nav-link ${router.pathname === '/dashboard/profile' ? 'active' : ''}`}>
                      Profile
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      onClick={handleLogout}
                      className="nav-link btn btn-link"
                    >
                      Logout
                    </button>
                  </li>
                  <li className="nav-item">
                    {children}
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link href="/auth/login" className={`nav-link ${router.pathname === '/auth/login' ? 'active' : ''}`}>
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/auth/register" className={`nav-link register-link ${router.pathname === '/auth/register' ? 'active' : ''}`}>
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      
      {/* Add padding to account for larger fixed navbar */}
      <div style={{ paddingTop: '100px' }}></div>
      
      <style jsx>{`
        .navbar {
          height: 90px;
          padding-top: 15px;
          padding-bottom: 15px;
          transition: all 0.3s ease;
          z-index: 1000;
        }
        
        .navbar-brand {
          padding: 0;
        }
        
        .nav-link {
          font-size: 1.1rem;
          padding: 0.5rem 1rem;
          margin: 0 0.2rem;
          border-radius: 5px;
          transition: all 0.2s ease;
        }
        
        .navbar-nav.mx-auto .nav-link {
          font-size: 1.25rem;
          padding: 0.5rem 1.2rem;
          font-weight: 400;
        }
        
        .navbar-light .nav-link:hover {
          background-color: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
        }
        
        .navbar-dark .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .navbar-light .nav-link.active {
          color: #0d6efd;
          font-weight: 500;
        }
        
        .navbar-dark .nav-link.active {
          color: white;
          font-weight: 500;
        }
        
        .register-link {
          color: #0d6efd;
          border: 1px solid #0d6efd;
          border-radius: 5px;
          margin-left: 0.5rem;
        }
        
        .register-link:hover {
          background-color: #0d6efd;
          color: white;
        }
        
        .navbar-dark .register-link {
          color: white;
          border: 1px solid white;
        }
        
        .navbar-dark .register-link:hover {
          background-color: white;
          color: #212529;
        }
      `}</style>
    </>
  );
};

export default Navbar;
