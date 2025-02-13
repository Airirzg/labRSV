import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/middleware/auth';
import ReservationForm from '@/components/ReservationForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';

interface Equipment {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'available' | 'in-use' | 'maintenance';
  lastMaintenance: string;
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
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipmentId,
          userId: user?.id,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create reservation');
      }

      // Redirect to dashboard after successful reservation
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reservation');
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
      <Navbar />
      
      <main className="container py-4">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="card-title h4 mb-4">Reserve Equipment</h2>
                
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
    </div>
  );
};

export default withAuth(CreateReservation);
