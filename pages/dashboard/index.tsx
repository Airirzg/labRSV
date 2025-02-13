import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/middleware/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorMessage from '@/components/ErrorMessage';

interface Reservation {
  id: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/reservations', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch reservations');
        }

        const data = await response.json();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reservations');
        console.error('Error fetching reservations:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReservations();
    }
  }, [user]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-warning';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light">
        <Navbar />
        <main className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
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
        <div className="row mb-4">
          <div className="col">
            <h1>Welcome, {user?.name || user?.email}</h1>
            <p className="text-muted">Manage your reservations</p>
          </div>
        </div>

        <ErrorMessage error={error} />

        <div className="card shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Your Reservations</h5>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/reservations/new'}
            >
              New Reservation
            </button>
          </div>
          <div className="card-body">
            {reservations.length === 0 ? (
              <div className="text-center my-5">
                <p className="text-muted mb-4">
                  You don't have any reservations yet.
                </p>
                <a href="/reservations/new" className="btn btn-primary">
                  Make Your First Reservation
                </a>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td>{reservation.id}</td>
                        <td>{new Date(reservation.startDate).toLocaleDateString()}</td>
                        <td>{new Date(reservation.endDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </td>
                        <td>{reservation.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default withAuth(Dashboard);
