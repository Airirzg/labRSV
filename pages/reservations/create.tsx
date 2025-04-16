import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/middleware/auth';
import ReservationForm from '@/components/ReservationForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import { showToast } from '@/utils/notifications';
import { Carousel } from 'react-bootstrap';
import Head from 'next/head';

interface Equipment {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'available' | 'in-use' | 'maintenance';
  lastMaintenance: string;
  imageUrl?: string | null;
  imageUrls?: string[];
}

const CreateReservation = () => {
  const router = useRouter();
  const { equipmentId } = router.query;
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!equipmentId) return;

      try {
        const response = await fetch(`/api/equipment/${equipmentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch equipment details');
        }
        const data = await response.json();
        setEquipment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load equipment');
        console.error('Error fetching equipment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [equipmentId]);

  const handleReservationSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!equipment) {
        throw new Error('Equipment details not loaded');
      }

      // Log the data being sent
      console.log('Submitting reservation with data:', {
        equipmentId: equipment.id,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes
      });

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipmentId: equipment.id,
          startDate: data.startDate,
          endDate: data.endDate,
          notes: data.notes || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        throw new Error(errorData.message || 'Failed to create reservation');
      }

      const result = await response.json();
      console.log('Reservation created:', result);

      // Show success message
      showToast('Reservation created successfully', 'success');

      // Redirect to dashboard after successful reservation
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reservation';
      console.error('Reservation error:', err);
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading equipment details..." />;
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-light">
        <Navbar />
        <main className="container py-5">
          <div className="alert alert-danger">
            Equipment not found or not available for reservation.
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <Head>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossOrigin="anonymous" />
      </Head>
      <Navbar />
      
      <main className="container py-4">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="card-title h4 mb-4">Reserve Equipment</h2>
                
                {/* Equipment Images Carousel */}
                {(equipment.imageUrl || (equipment.imageUrls && equipment.imageUrls.length > 0)) && (
                  <div className="mb-4">
                    <Carousel className="equipment-carousel rounded overflow-hidden shadow-sm">
                      {equipment.imageUrl && (
                        <Carousel.Item>
                          <div className="carousel-image-container" style={{ height: '300px', background: '#f8f9fa' }}>
                            <img
                              className="d-block w-100 h-100"
                              src={equipment.imageUrl}
                              alt={equipment.name}
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                        </Carousel.Item>
                      )}
                      {equipment.imageUrls?.map((imageUrl, index) => (
                        <Carousel.Item key={index}>
                          <div className="carousel-image-container" style={{ height: '300px', background: '#f8f9fa' }}>
                            <img
                              className="d-block w-100 h-100"
                              src={imageUrl}
                              alt={`${equipment.name} - Image ${index + 1}`}
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="h5">Equipment Details</h3>
                  <p className="mb-2"><strong>Name:</strong> {equipment.name}</p>
                  <p className="mb-2"><strong>Type:</strong> {equipment.type}</p>
                  <p className="mb-0"><strong>Description:</strong> {equipment.description}</p>
                </div>

                <ErrorMessage error={error} />

                <ReservationForm onSubmit={handleReservationSubmit} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Custom styles for carousel controls */}
      <style jsx global>{`
        .carousel-control-prev,
        .carousel-control-next {
          background-color: rgba(0, 0, 0, 0.3);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
          margin: 0 10px;
        }
        
        .carousel-indicators {
          margin-bottom: 0.5rem;
        }
        
        .carousel-indicators button {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin: 0 5px;
        }
      `}</style>
    </div>
  );
};

export default withAuth(CreateReservation);
