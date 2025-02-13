import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const router = useRouter();
  const { user, logout: handleLogout } = useAuth();

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top">
        <div className="container">
          <Link href="/" className="navbar-brand">
            Reservation System
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
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link href="/auth/login" className={`nav-link ${router.pathname === '/auth/login' ? 'active' : ''}`}>
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/auth/register" className={`nav-link ${router.pathname === '/auth/register' ? 'active' : ''}`}>
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      {/* Add padding to prevent content from hiding under navbar */}
      <div style={{ paddingTop: '56px' }}></div>
    </>
  );
};

export default Navbar;
