import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/middleware/auth';
import ProfileForm from '@/components/ProfileForm';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { UserProfile } from '@/types/user';
import { Booking } from '@/types/booking';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch profile data
        const profileResponse = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Fetch bookings
        const bookingsResponse = await fetch('/api/users/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!bookingsResponse.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  if (loading) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <main className="container py-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="text-center mb-4">
                  <div className="avatar mb-3">
                    <span className="avatar-text">
                      {user?.name?.[0] || user?.email?.[0] || '?'}
                    </span>
                  </div>
                  <h5 className="card-title mb-0">{user?.name || user?.email}</h5>
                  <p className="text-muted small">{user?.email}</p>
                </div>
                
                <div className="list-group list-group-flush">
                  <Link href="/dashboard" className="list-group-item list-group-item-action">
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Link>
                  <Link href="/dashboard/profile" className="list-group-item list-group-item-action active">
                    <i className="bi bi-person me-2"></i>
                    Profile Settings
                  </Link>
                  <Link href="/dashboard/bookings" className="list-group-item list-group-item-action">
                    <i className="bi bi-calendar-check me-2"></i>
                    My Bookings
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9">
            <ErrorMessage error={error} />

            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Profile Information</h5>
              </div>
              <div className="card-body">
                <ErrorBoundary>
                  <ProfileForm
                    initialData={profile}
                    onSubmit={async (data) => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch('/api/users/profile', {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                          },
                          body: JSON.stringify(data),
                        });

                        if (!response.ok) {
                          throw new Error('Failed to update profile');
                        }

                        const updatedProfile = await response.json();
                        setProfile(updatedProfile);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to update profile');
                        console.error('Error updating profile:', err);
                      }
                    }}
                  />
                </ErrorBoundary>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Recent Bookings</h5>
                <Link href="/dashboard/bookings" className="btn btn-primary btn-sm">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {bookings.length === 0 ? (
                  <p className="text-muted text-center mb-0">No bookings found</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Equipment</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((booking) => (
                          <tr key={booking.id}>
                            <td>{booking.equipment}</td>
                            <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                            <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${
                                booking.status === 'approved' ? 'bg-success' :
                                booking.status === 'rejected' ? 'bg-danger' :
                                'bg-warning'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
