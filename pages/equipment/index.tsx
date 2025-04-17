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
            <div className="sticky-sidebar" style={{ 
              position: 'sticky', 
              top: '20px', 
              height: 'calc(100vh - 40px)',
              overflowY: 'auto'
            }}>
              <SearchSidebar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                showAvailableOnly={showAvailableOnly}
                setShowAvailableOnly={setShowAvailableOnly}
              />
            </div>
          </div>

          {/* Equipment Cards */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0 fw-bold">Equipment Catalog</h2>
              <div className="d-flex align-items-center">
                <span className="badge bg-light text-dark border me-2">
                  <i className="bi bi-grid-3x3-gap-fill me-1"></i> 
                  {filteredEquipment.length} items
                </span>
              </div>
            </div>

            {filteredEquipment.length === 0 ? (
              <div className="text-center py-5 my-4 bg-white rounded shadow-sm">
                <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-3 mb-2">No equipment found</h4>
                <p className="text-muted">Try adjusting your search filters</p>
                <button 
                  className="btn btn-outline-primary mt-2"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setShowAvailableOnly(false);
                  }}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {filteredEquipment.map((item) => (
                  <div key={item.id} className="col-md-6 col-lg-4">
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
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
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
                          {item.description || <span className="text-muted fst-italic">No description available</span>}
                        </p>
                        <p className="card-text small text-muted mb-0">
                          <i className="bi bi-geo-alt-fill me-1"></i>
                          {item.location || 'Location not specified'}
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
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EquipmentPage;
