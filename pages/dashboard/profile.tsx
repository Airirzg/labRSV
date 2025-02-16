import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/middleware/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import { ReservationStatus } from '@prisma/client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

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
      category: {
        name: string;
      };
    };
    startDate: string;
    endDate: string;
    status: ReservationStatus;
  }>;
}

const statusColors: Record<ReservationStatus, string> = {
  PENDING: 'bg-warning',
  APPROVED: 'bg-success',
  REJECTED: 'bg-danger',
  CANCELLED: 'bg-secondary',
  COMPLETED: 'bg-info',
};

const statusLabels: Record<ReservationStatus, string> = {
  PENDING: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'calendar' | 'history'>('profile');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user) {
          console.error('No authentication token found');
          setNotificationError('Not authenticated');
          return;
        }

        console.log('User object:', user);
        const response = await fetch(`/api/notifications?userId=${user.id}&type=ALL`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch notifications');
        }

        const data = await response.json();
        console.log('Received notifications:', data);
        setNotifications(data.notifications || []);
        setNotificationError(null);
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
        setNotificationError(error.message || 'Error fetching notifications');
        setNotifications([]);
      }
    };

    if (user?.id) {
      fetchNotifications();
      // Fetch notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      console.log('No user ID available');
    }
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('notificationsDropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark notifications as read');
      }

      // Update local state to remove read notifications
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
    } catch (error: any) {
      console.error('Error marking notifications as read:', error);
      setNotificationError(error.message || 'Error marking notifications as read');
    }
  };

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

  const getCalendarEvents = () => {
    if (!profile?.reservations) return [];
    
    return profile.reservations.map(reservation => ({
      id: reservation.id,
      title: `${reservation.equipment.name} (${statusLabels[reservation.status]})`,
      start: reservation.startDate,
      end: reservation.endDate,
      backgroundColor: statusColors[reservation.status].replace('bg-', ''),
      borderColor: statusColors[reservation.status].replace('bg-', ''),
      extendedProps: { reservation }
    }));
  };

  const renderNotificationContent = (notification: any) => {
    if (notification.type === 'MESSAGE' && notification.messageDetails) {
      const message = notification.messageDetails;
      const metadata = notification.metadata ? JSON.parse(notification.metadata) : null;
      
      return (
        <div className="notification-content">
          <div className="d-flex w-100 justify-content-between">
            <h6 className="mb-1">{notification.title}</h6>
            <small className="text-muted">
              {new Date(message.createdAt).toLocaleString()}
            </small>
          </div>
          <div className="message-details">
            <p className="mb-1">
              <strong>From:</strong> {message.senderName}<br />
              <strong>Subject:</strong> {message.subject}
            </p>
            <div className="message-content p-2 bg-light rounded">
              {message.content}
            </div>
            {metadata?.parentMessageId && (
              <div className="original-message mt-2 p-2 bg-light rounded">
                <small className="text-muted d-block mb-1">In reply to:</small>
                <small><strong>{metadata.subject}</strong></small>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="notification-content">
        <div className="d-flex w-100 justify-content-between">
          <h6 className="mb-1">{notification.title}</h6>
          <small className="text-muted">
            {new Date(notification.createdAt).toLocaleString()}
          </small>
        </div>
        <p className="mb-1">{notification.message}</p>
      </div>
    );
  };

  const notificationsButton = (
    <div className="dropdown" id="notificationsDropdown">
      <button
        className="btn btn-light position-relative me-3"
        onClick={(e) => {
          e.stopPropagation();
          setShowNotifications(!showNotifications);
        }}
      >
        <i className="bi bi-bell"></i>
        {notifications.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {notifications.length}
          </span>
        )}
      </button>
      {showNotifications && (
        <div 
          className="dropdown-menu show position-absolute mt-2" 
          style={{ 
            right: 0, 
            minWidth: '300px', 
            maxHeight: '400px', 
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
          }}
        >
          {notifications.length === 0 ? (
            <div className="dropdown-item text-center text-muted py-3">
              No new notifications
            </div>
          ) : (
            <>
              <div className="list-group list-group-flush">
                {notifications.map((notification) => (
                  <div key={notification.id} className="list-group-item">
                    {renderNotificationContent(notification)}
                    <button
                      className="btn btn-sm btn-light mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead([notification.id]);
                      }}
                    >
                      Mark as read
                    </button>
                  </div>
                ))}
              </div>
              {notifications.length > 1 && (
                <div className="dropdown-item border-top">
                  <button
                    className="btn btn-sm btn-link text-primary w-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notifications.map(n => n.id));
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </>
          )}
          {notificationError && (
            <div className="dropdown-item text-center text-danger py-3">
              {notificationError}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!profile) return <ErrorMessage message="Profile not found" />;

  return (
    <div className="min-h-screen bg-light">
      <Navbar>
        {notificationsButton}
      </Navbar>
      <main className="container py-4">
        <div className="row">
          <div className="col-md-3">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="text-center mb-4">
                  <div className="avatar-placeholder mb-2">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </div>
                  <h4>{profile.firstName} {profile.lastName}</h4>
                  <p className="text-muted">{profile.role}</p>
                </div>
                <div className="list-group">
                  <button
                    className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile Information
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${activeTab === 'calendar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calendar')}
                  >
                    Reservation Calendar
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                  >
                    Reservation History
                  </button>
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Quick Stats</h5>
                <div className="mb-3">
                  <small className="text-muted">Total Reservations</small>
                  <h4>{profile.reservations?.length || 0}</h4>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Pending Approvals</small>
                  <h4>{profile.reservations?.filter(r => r.status === 'PENDING').length || 0}</h4>
                </div>
                <div>
                  <small className="text-muted">Active Reservations</small>
                  <h4>{profile.reservations?.filter(r => r.status === 'APPROVED').length || 0}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="card shadow-sm">
              <div className="card-body">
                {activeTab === 'profile' && (
                  <div>
                    <h3 className="card-title mb-4">Profile Information</h3>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <p className="form-control-static">{profile.email}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone Number</label>
                        <p className="form-control-static">{profile.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Member Since</label>
                        <p className="form-control-static">{new Date(profile.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Account Type</label>
                        <p className="form-control-static">{profile.role}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'calendar' && (
                  <div>
                    <h3 className="card-title mb-4">Reservation Calendar</h3>
                    <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      events={getCalendarEvents()}
                      height="auto"
                      headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek'
                      }}
                    />
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <h3 className="card-title mb-4">Reservation History</h3>
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Equipment</th>
                            <th>Category</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profile.reservations?.map(reservation => (
                            <tr key={reservation.id}>
                              <td>{reservation.equipment.name}</td>
                              <td>{reservation.equipment.category.name}</td>
                              <td>{new Date(reservation.startDate).toLocaleDateString()}</td>
                              <td>{new Date(reservation.endDate).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${statusColors[reservation.status]}`}>
                                  {statusLabels[reservation.status]}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
