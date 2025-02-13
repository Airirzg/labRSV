import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/middleware/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  createdAt: string;
  reservations?: Array<{
    id: string;
    equipment: {
      id: string;
      name: string;
      category: string;
    };
    startDate: string;
    endDate: string;
    status: string;
  }>;
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-light">
        <Navbar />
        <main className="container py-4">
          <Loading />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light">
        <Navbar />
        <main className="container py-4">
          <ErrorMessage message={error} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-light">
        <Navbar />
        <main className="container py-4">
          <div className="alert alert-warning">
            Profile not found.
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
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="card-title mb-4">Profile Information</h2>
                
                <div className="mb-4">
                  <h3 className="h5">Personal Details</h3>
                  <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  {profile.phoneNumber && (
                    <p><strong>Phone:</strong> {profile.phoneNumber}</p>
                  )}
                  <p><strong>Role:</strong> {profile.role}</p>
                  <p><strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>

                {profile.reservations && profile.reservations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="h5">Recent Reservations</h3>
                    <div className="list-group">
                      {profile.reservations.map(reservation => (
                        <div key={reservation.id} className="list-group-item">
                          <h4 className="h6">{reservation.equipment.name}</h4>
                          <p className="mb-1">
                            <small>
                              {new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}
                            </small>
                          </p>
                          <span className={`badge bg-${reservation.status === 'APPROVED' ? 'success' : 
                            reservation.status === 'PENDING' ? 'warning' : 
                            reservation.status === 'REJECTED' ? 'danger' : 'secondary'}`}>
                            {reservation.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default withAuth(Profile);
