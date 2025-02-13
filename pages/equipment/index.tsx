import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import SearchSidebar from '@/components/SearchSidebar';

interface Category {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: Category;
  status: string;
  availability: boolean;
  imageUrl: string;
  location: string;
}

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
      setError('Failed to load equipment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterEquipment = () => {
    let filtered = [...equipment];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      filtered = filtered.filter(item => item.availability && item.status === 'AVAILABLE');
    }

    setFilteredEquipment(filtered);
  };

  const handleReserve = (equipmentId: string) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    router.push(`/reservations/create?equipmentId=${equipmentId}`);
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

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <main className="container-fluid py-4">
        <div className="row">
          {/* Search Sidebar */}
          <div className="col-lg-3">
            <SearchSidebar
              onSearch={setSearchTerm}
              onCategoryFilter={setSelectedCategory}
              onAvailabilityFilter={setShowAvailableOnly}
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
                      <img
                        src={item.imageUrl || '/images/equipment-placeholder.jpg'}
                        className="card-img-top"
                        alt={item.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title mb-0">{item.name}</h5>
                          <span className={`badge ${item.status === 'AVAILABLE' && item.availability ? 'bg-success' : 'bg-danger'}`}>
                            {item.status === 'AVAILABLE' && item.availability ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                        <p className="card-text text-muted small mb-2">
                          Category: {item.category.name}
                        </p>
                        <p className="card-text text-muted small mb-2">
                          Location: {item.location}
                        </p>
                        <p className="card-text mb-3">{item.description}</p>
                        <div className="d-flex justify-content-end">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleReserve(item.id)}
                            disabled={!(item.status === 'AVAILABLE' && item.availability)}
                          >
                            {item.status === 'AVAILABLE' && item.availability ? 'Reserve' : 'Not Available'}
                          </button>
                        </div>
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
