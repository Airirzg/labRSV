import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import SearchSidebar from '@/components/SearchSidebar';
import { Status } from '@prisma/client';

interface Category {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: Category;
  status: Status;
  availability: boolean;
  imageUrl: string;
  location: string;
}

const statusColors: Record<Status, string> = {
  AVAILABLE: 'bg-success',
  IN_USE: 'bg-warning',
  MAINTENANCE: 'bg-danger',
};

const statusLabels: Record<Status, string> = {
  AVAILABLE: 'Available',
  IN_USE: 'In Use',
  MAINTENANCE: 'Under Maintenance',
};

const EquipmentPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchTerm, selectedCategory, showAvailableOnly]);

  const fetchEquipment = async () => {
    try {
      console.log('Fetching equipment...');
      const response = await fetch('/api/equipment');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch equipment');
      }
      const data = await response.json();
      console.log('Received equipment:', data);
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid equipment data format');
      }
      setEquipment(data.items);
      setFilteredEquipment(data.items);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError(err instanceof Error ? err.message : 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const filterEquipment = () => {
    let filtered = [...equipment];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(item =>
        item.category.id === selectedCategory
      );
    }

    // Apply availability filter
    if (showAvailableOnly) {
      filtered = filtered.filter(item => item.status === 'AVAILABLE');
    }

    setFilteredEquipment(filtered);
  };

  if (loading) return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <main className="container py-4">
        <Loading />
      </main>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <main className="container py-4">
        <div className="text-center text-danger mt-5">{error}</div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <main className="container-fluid py-4">
        <div className="row">
          {/* Search Sidebar */}
          <div className="col-lg-3">
            <SearchSidebar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              showAvailableOnly={showAvailableOnly}
              setShowAvailableOnly={setShowAvailableOnly}
            />
          </div>

          {/* Equipment Cards */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0 h4">Available Equipment</h2>
              <div className="d-flex align-items-center">
                <span className="text-muted me-2">
                  {filteredEquipment.length} {filteredEquipment.length === 1 ? 'item' : 'items'} found
                </span>
                <div className="dropdown ms-2">
                  <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" id="sortDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="bi bi-sort-alpha-down me-1"></i> Sort
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="sortDropdown">
                    <li><button className="dropdown-item" type="button">Name (A-Z)</button></li>
                    <li><button className="dropdown-item" type="button">Name (Z-A)</button></li>
                    <li><button className="dropdown-item" type="button">Category</button></li>
                    <li><button className="dropdown-item" type="button">Status</button></li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="row g-4">
              {filteredEquipment.length === 0 ? (
                <div className="col-12">
                  <div className="alert alert-info d-flex align-items-center">
                    <i className="bi bi-info-circle-fill me-2 fs-4"></i>
                    <div>No equipment found matching your criteria.</div>
                  </div>
                </div>
              ) : (
                filteredEquipment.map((item) => (
                  <div key={item.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 border-0 shadow-sm hover-card" style={{
                      transition: 'all 0.3s ease',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}>
                      <div className="position-relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            className="card-img-top"
                            alt={item.name}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div 
                            className="card-img-top d-flex align-items-center justify-content-center bg-light text-secondary" 
                            style={{ height: '200px' }}
                          >
                            <i className="bi bi-image fs-1"></i>
                          </div>
                        )}
                        <div 
                          className="position-absolute top-0 end-0 m-2"
                          style={{ zIndex: 1 }}
                        >
                          <span className={`badge ${statusColors[item.status]} text-white px-3 py-2 rounded-pill`}>
                            {statusLabels[item.status]}
                          </span>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title mb-0 fw-bold">{item.name}</h5>
                        </div>
                        <span className="badge bg-light text-dark mb-3">
                          <i className="bi bi-tag-fill me-1"></i>
                          {item.category.name}
                        </span>
                        <p className="card-text" style={{ 
                          fontSize: '0.95rem',
                          height: '4.5rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {item.description}
                        </p>
                        <p className="card-text small text-muted mb-0">
                          <i className="bi bi-geo-alt-fill me-1"></i>
                          {item.location}
                        </p>
                      </div>
                      <div className="card-footer bg-white border-0 p-4 pt-0">
                        <button
                          className={`btn ${item.status === 'AVAILABLE' ? 'btn-primary' : 'btn-secondary'} w-100 py-2`}
                          onClick={() => router.push(`/reservations/create?equipmentId=${item.id}`)}
                          disabled={item.status !== 'AVAILABLE'}
                          style={{
                            borderRadius: '8px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {item.status === 'AVAILABLE' ? (
                            <>
                              <i className="bi bi-calendar-plus me-2"></i>
                              Reserve Now
                            </>
                          ) : (
                            <>
                              <i className="bi bi-x-circle me-2"></i>
                              Not Available
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EquipmentPage;
