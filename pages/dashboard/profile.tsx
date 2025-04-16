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
import { FiUser, FiCalendar, FiClock, FiMail, FiPhone, FiCheck, FiCheckCircle } from 'react-icons/fi';

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

// Define custom status types to include CANCELLED if it's not in the Prisma enum
type ExtendedReservationStatus = ReservationStatus | 'CANCELLED' | 'COMPLETED' | 'ONGOING' | 'FINISHED';

const statusColors: Record<ExtendedReservationStatus, string> = {
  PENDING: 'bg-warning',
  APPROVED: 'bg-success',
  REJECTED: 'bg-danger',
  CANCELLED: 'bg-secondary',
  COMPLETED: 'bg-info',
  ONGOING: 'bg-primary',
  FINISHED: 'bg-dark'
};

const statusLabels: Record<ExtendedReservationStatus, string> = {
  PENDING: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  ONGOING: 'Ongoing',
  FINISHED: 'Finished'
};

// Define the props for ErrorMessage component
interface ErrorMessageProps {
  error: string;
}

// Create a wrapper component to handle the prop conversion
const ErrorMessageWrapper = ({ message }: { message: string }) => (
  <ErrorMessage error={message} />
);

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
      title: `${reservation.equipment.name} (${statusLabels[reservation.status as ExtendedReservationStatus]})`,
      start: reservation.startDate,
      end: reservation.endDate,
      backgroundColor: statusColors[reservation.status as ExtendedReservationStatus].replace('bg-', ''),
      borderColor: statusColors[reservation.status as ExtendedReservationStatus].replace('bg-', ''),
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
        className="btn btn-light position-relative me-3 rounded-circle p-2"
        onClick={(e) => {
          e.stopPropagation();
          setShowNotifications(!showNotifications);
        }}
        style={{ width: '40px', height: '40px' }}
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
          className="dropdown-menu show position-absolute mt-2 rounded-3 border-0 shadow" 
          style={{ 
            right: 0, 
            minWidth: '320px', 
            maxHeight: '450px', 
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="p-3 border-bottom">
            <h6 className="mb-0 fw-bold">Notifications</h6>
          </div>
          {notifications.length === 0 ? (
            <div className="dropdown-item text-center text-muted py-4">
              <i className="bi bi-bell-slash fs-4 mb-2 d-block"></i>
              No new notifications
            </div>
          ) : (
            <>
              <div className="list-group list-group-flush">
                {notifications.map((notification) => (
                  <div key={notification.id} className="list-group-item border-0 py-3">
                    {renderNotificationContent(notification)}
                    <button
                      className="btn btn-sm btn-outline-primary rounded-pill mt-2 px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead([notification.id]);
                      }}
                    >
                      <i className="bi bi-check2 me-1"></i> Mark as read
                    </button>
                  </div>
                ))}
              </div>
              {notifications.length > 1 && (
                <div className="dropdown-item border-top p-2">
                  <button
                    className="btn btn-sm btn-outline-primary rounded-pill w-100"
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
  if (error) return <ErrorMessageWrapper message={error} />;
  if (!profile) return <ErrorMessageWrapper message="Profile not found" />;

  return (
    <div className="min-h-screen bg-light">
      <Navbar>
        {notificationsButton}
      </Navbar>
      <main className="container py-5">
        {/* Profile Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 rounded-3 shadow-sm overflow-hidden">
              <div className="card-body p-0">
                <div className="bg-primary text-white p-4 pb-0">
                  <div className="row align-items-end">
                    <div className="col-md-8">
                      <div className="d-flex align-items-center">
                        <div className="avatar-placeholder rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-3 border border-3 border-white shadow-sm" 
                          style={{ width: '80px', height: '80px', fontSize: '1.75rem', marginBottom: '-20px' }}>
                          {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                        </div>
                        <div>
                          <h2 className="mb-1 fw-bold">{profile.firstName} {profile.lastName}</h2>
                          <p className="mb-4 d-flex align-items-center">
                            <FiMail className="me-2" /> {profile.email}
                            {profile.phoneNumber && (
                              <span className="ms-3 d-flex align-items-center">
                                <FiPhone className="me-2" /> {profile.phoneNumber}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 text-md-end mb-3">
                      <span className="badge bg-white text-primary px-3 py-2 rounded-pill fw-normal">
                        <FiUser className="me-1" /> {profile.role}
                      </span>
                      <p className="text-white-50 mt-2 mb-0 small">
                        <FiCheck className="me-1" /> Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white px-4 py-2">
                  <ul className="nav nav-tabs border-0">
                    <li className="nav-item">
                      <button 
                        className={`nav-link border-0 px-3 py-3 ${activeTab === 'profile' ? 'active fw-medium text-primary' : 'text-muted'}`}
                        onClick={() => setActiveTab('profile')}
                      >
                        <FiUser className="me-2" /> Profile
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        className={`nav-link border-0 px-3 py-3 ${activeTab === 'calendar' ? 'active fw-medium text-primary' : 'text-muted'}`}
                        onClick={() => setActiveTab('calendar')}
                      >
                        <FiCalendar className="me-2" /> Calendar
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        className={`nav-link border-0 px-3 py-3 ${activeTab === 'history' ? 'active fw-medium text-primary' : 'text-muted'}`}
                        onClick={() => setActiveTab('history')}
                      >
                        <FiClock className="me-2" /> History
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Stats Cards */}
          <div className="col-md-3">
            <div className="row g-4">
              <div className="col-md-12">
                <div className="card border-0 rounded-3 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title fw-bold mb-4">Quick Stats</h5>
                    <div className="mb-4">
                      <div className="d-flex align-items-center mb-2">
                        <div className="stat-icon rounded-circle d-flex align-items-center justify-content-center me-3" 
                          style={{ width: '48px', height: '48px', backgroundColor: 'rgba(108, 92, 231, 0.1)' }}>
                          <FiCalendar className="text-primary fs-4" />
                        </div>
                        <div>
                          <h2 className="mb-0 fw-bold">{profile.reservations?.length || 0}</h2>
                          <p className="text-muted mb-0">Total Reservations</p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="d-flex align-items-center mb-2">
                        <div className="stat-icon rounded-circle d-flex align-items-center justify-content-center me-3" 
                          style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                          <FiClock className="text-warning fs-4" />
                        </div>
                        <div>
                          <h2 className="mb-0 fw-bold">{profile.reservations?.filter(r => r.status === 'PENDING').length || 0}</h2>
                          <p className="text-muted mb-0">Pending Approvals</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="d-flex align-items-center mb-2">
                        <div className="stat-icon rounded-circle d-flex align-items-center justify-content-center me-3" 
                          style={{ width: '48px', height: '48px', backgroundColor: 'rgba(40, 167, 69, 0.1)' }}>
                          <FiCheckCircle className="text-success fs-4" />
                        </div>
                        <div>
                          <h2 className="mb-0 fw-bold">{profile.reservations?.filter(r => r.status === 'APPROVED').length || 0}</h2>
                          <p className="text-muted mb-0">Active Reservations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9">
            <div className="card border-0 rounded-3 shadow-sm">
              <div className="card-body p-4">
                {activeTab === 'profile' && (
                  <div>
                    <h3 className="card-title fw-bold mb-4">Profile Information</h3>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="profile-info-card p-3 rounded-3 h-100" style={{ backgroundColor: 'rgba(108, 92, 231, 0.05)' }}>
                          <h6 className="text-muted mb-3 d-flex align-items-center">
                            <FiMail className="me-2" /> Email Address
                          </h6>
                          <p className="fs-5 mb-0">{profile.email}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="profile-info-card p-3 rounded-3 h-100" style={{ backgroundColor: 'rgba(0, 206, 201, 0.05)' }}>
                          <h6 className="text-muted mb-3 d-flex align-items-center">
                            <FiPhone className="me-2" /> Phone Number
                          </h6>
                          <p className="fs-5 mb-0">{profile.phoneNumber || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="profile-info-card p-3 rounded-3 h-100" style={{ backgroundColor: 'rgba(9, 132, 227, 0.05)' }}>
                          <h6 className="text-muted mb-3 d-flex align-items-center">
                            <FiCheck className="me-2" /> Member Since
                          </h6>
                          <p className="fs-5 mb-0">{new Date(profile.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="profile-info-card p-3 rounded-3 h-100" style={{ backgroundColor: 'rgba(232, 67, 147, 0.05)' }}>
                          <h6 className="text-muted mb-3 d-flex align-items-center">
                            <FiUser className="me-2" /> Account Type
                          </h6>
                          <p className="fs-5 mb-0">
                            <span className="badge bg-primary rounded-pill px-3 py-2">{profile.role}</span>
                          </p>
                        </div>
                      </div>
                      <div className="col-12 mt-3">
                        <div className="d-flex justify-content-end">
                          <button className="btn btn-outline-primary rounded-pill px-4">
                            <i className="bi bi-pencil me-2"></i> Edit Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'calendar' && (
                  <div>
                    <h3 className="card-title fw-bold mb-4">Reservation Calendar</h3>
                    <div className="calendar-container p-3 bg-white rounded-3 border">
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
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <h3 className="card-title fw-bold mb-4">Reservation History</h3>
                    {profile.reservations && profile.reservations.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
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
                              <tr key={reservation.id} className="align-middle">
                                <td className="fw-medium">{reservation.equipment.name}</td>
                                <td>{reservation.equipment.category.name}</td>
                                <td>{new Date(reservation.startDate).toLocaleDateString()}</td>
                                <td>{new Date(reservation.endDate).toLocaleDateString()}</td>
                                <td>
                                  <span className={`badge ${statusColors[reservation.status as ExtendedReservationStatus]} rounded-pill px-3 py-2`}>
                                    {statusLabels[reservation.status as ExtendedReservationStatus]}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-5 bg-light rounded-3">
                        <i className="bi bi-calendar-x fs-1 text-muted mb-3 d-block"></i>
                        <h5 className="text-muted">No reservation history found</h5>
                        <p className="mb-4">You haven't made any equipment reservations yet.</p>
                        <button 
                          className="btn btn-primary rounded-pill px-4"
                          onClick={() => router.push('/equipment')}
                        >
                          Browse Equipment
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      <style jsx>{`
        .nav-tabs .nav-link.active {
          position: relative;
        }
        .nav-tabs .nav-link.active:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: #007bff;
          border-radius: 3px 3px 0 0;
        }
      `}</style>
    </div>
  );
};

export default withAuth(Profile);
