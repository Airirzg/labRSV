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
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="row g-4">
              {filteredEquipment.length === 0 ? (
                <div className="col-12">
                  <div className="alert alert-info">
                    No equipment found matching your criteria.
                  </div>
                </div>
              ) : (
                filteredEquipment.map((item) => (
                  <div key={item.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          className="card-img-top"
                          alt={item.name}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      )}
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title mb-0">{item.name}</h5>
                          <span className={`badge ${statusColors[item.status]} text-white`}>
                            {statusLabels[item.status]}
                          </span>
                        </div>
                        <p className="card-text text-muted small mb-2">
                          Category: {item.category.name}
                        </p>
                        <p className="card-text">{item.description}</p>
                        <p className="card-text small">
                          <i className="bi bi-geo-alt-fill me-1"></i>
                          {item.location}
                        </p>
                      </div>
                      <div className="card-footer bg-transparent">
                        <button
                          className="btn btn-primary w-100"
                          onClick={() => router.push(`/reservations/create?equipmentId=${item.id}`)}
                          disabled={item.status !== 'AVAILABLE'}
                        >
                          {item.status === 'AVAILABLE' ? 'Reserve Now' : 'Not Available'}
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
