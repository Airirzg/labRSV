import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
import { z } from 'zod';
import Link from 'next/link';
import { 
  FiHome, 
  FiBox, 
  FiCalendar, 
  FiUsers, 
  FiMessageSquare, 
  FiSettings, 
  FiBell, 
  FiUser,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import styles from '@/styles/AdminDashboard.module.css';

interface Reservation {
  id: string;
  userId: string;
  equipmentId: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ONGOING' | 'FINISHED';
  user: {
    name: string;
    email: string;
  };
  equipment: {
    name: string;
  };
}

interface Equipment {
  id: string;
  name: string;
  status: string;
}

const statusColors = {
  PENDING: '#ffd700',
  APPROVED: '#4caf50',
  REJECTED: '#f44336',
  ONGOING: '#2196f3',
  FINISHED: '#9e9e9e',
};

const itemsPerPage = 10;

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminName, setAdminName] = useState('Admin User');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  // Add statistics state
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingApprovals: 0,
    activeReservations: 0,
    totalEquipment: 0,
    availableEquipment: 0,
  });

  useEffect(() => {
    // Initialize SSE connection
    const eventSource = new EventSource('/api/admin/events');
    const token = localStorage.getItem('token');

    // Initial fetch of reservations and equipment
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        console.log('Fetching initial data with token:', token);

        const [reservationsRes, equipmentRes] = await Promise.all([
          fetch('/api/admin/reservations', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('/api/admin/equipment', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);

        if (!reservationsRes.ok) {
          const errorData = await reservationsRes.json();
          throw new Error(`Failed to fetch reservations: ${errorData.message}`);
        }

        if (!equipmentRes.ok) {
          const errorData = await equipmentRes.json();
          throw new Error(`Failed to fetch equipment: ${errorData.message}`);
        }

        const reservationsData = await reservationsRes.json();
        const equipmentData = await equipmentRes.json();

        console.log('Fetched reservations:', reservationsData);
        console.log('Fetched equipment:', equipmentData);

        if (reservationsData.items && Array.isArray(reservationsData.items)) {
          console.log('Setting reservations:', reservationsData.items.length);
          setReservations(reservationsData.items);
        } else {
          console.warn('Invalid reservations data format:', reservationsData);
          setReservations([]);
        }

        if (equipmentData.items && Array.isArray(equipmentData.items)) {
          console.log('Setting equipment:', equipmentData.items.length);
          setEquipment(equipmentData.items);
        } else {
          console.warn('Invalid equipment data format:', equipmentData);
          setEquipment([]);
        }

        setLoading(false);
        setError('');
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
        setLoading(false);
        setReservations([]);
        setEquipment([]);
      }
    };

    fetchInitialData();

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE message received:', data);
        if (Array.isArray(data)) {
          setReservations(data);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.addEventListener('initial', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE initial data received:', data);
        if (Array.isArray(data)) {
          setReservations(data);
        }
      } catch (error) {
        console.error('Error parsing initial data:', error);
      }
    });

    eventSource.addEventListener('update', (event) => {
      try {
        const updatedReservation = JSON.parse(event.data);
        console.log('SSE update received:', updatedReservation);
        setReservations(prev => 
          prev.map(res => 
            res.id === updatedReservation.id ? updatedReservation : res
          )
        );
        toast.success('Reservation updated!');
      } catch (error) {
        console.error('Error processing update:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Update statistics whenever reservations or equipment changes
  useEffect(() => {
    console.log('Updating statistics with:', {
      reservationsCount: reservations.length,
      equipmentCount: equipment.length
    });

    // Total Reservations
    setStats(prev => ({
      ...prev,
      totalReservations: reservations.length
    }));

    // Pending Approvals
    const pendingCount = reservations.filter(
      reservation => reservation.status === 'PENDING'
    ).length;
    console.log('Pending approvals:', pendingCount);
    setStats(prev => ({
      ...prev,
      pendingApprovals: pendingCount
    }));

    // Active Reservations (APPROVED and not finished)
    const now = new Date();
    const activeCount = reservations.filter(reservation => 
      reservation.status === 'APPROVED' &&
      new Date(reservation.endDate) > now
    ).length;
    console.log('Active reservations:', activeCount);
    setStats(prev => ({
      ...prev,
      activeReservations: activeCount
    }));

    // Total Equipment
    setStats(prev => ({
      ...prev,
      totalEquipment: equipment.length
    }));

    // Available Equipment (not in active reservations)
    const activeReservationEquipmentIds = new Set(
      reservations
        .filter(reservation => 
          reservation.status === 'APPROVED' &&
          new Date(reservation.startDate) <= now &&
          new Date(reservation.endDate) > now
        )
        .map(reservation => reservation.equipment?.id)
        .filter(Boolean)
    );

    const availableCount = equipment.filter(
      item => !activeReservationEquipmentIds.has(item.id)
    ).length;
    console.log('Available equipment:', availableCount);

    setStats(prev => ({
      ...prev,
      availableEquipment: availableCount
    }));

  }, [reservations, equipment]);

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const calendarEvents = reservations.map((reservation) => ({
    id: reservation.id,
    title: `${reservation.equipment?.name || 'Unknown'} - ${reservation.user ? `${reservation.user.firstName} ${reservation.user.lastName}` : 'Unknown'}`,
    start: reservation.startDate,
    end: reservation.endDate,
    backgroundColor: statusColors[reservation.status],
    extendedProps: { reservation }
  }));

  const handleEventClick = (info: any) => {
    const reservation = info.event.extendedProps.reservation;
    if (reservation.status === 'PENDING') {
      toast(
        <div>
          <p className="mb-2">{reservation.equipment?.name || 'Unknown'} reserved by {reservation.user ? `${reservation.user.firstName} ${reservation.user.lastName}` : 'Unknown'}</p>
          <p className="mb-2">From: {new Date(reservation.startDate).toLocaleString()}</p>
          <p className="mb-0">To: {new Date(reservation.endDate).toLocaleString()}</p>
          <div className="d-flex gap-2 mt-3">
            <button
              onClick={() => handleStatusChange(reservation.id, 'APPROVED')}
              className="btn btn-success btn-sm"
            >
              Approve
            </button>
            <button
              onClick={() => handleStatusChange(reservation.id, 'REJECTED')}
              className="btn btn-danger btn-sm"
            >
              Reject
            </button>
          </div>
        </div>,
        { autoClose: false }
      );
    }
  };

  const filteredReservations = reservations
    .filter(reservation => {
      if (!searchTerm) return true;
      
      const searchString = searchTerm.toLowerCase();
      const userName = reservation.user ? 
        `${reservation.user.firstName || ''} ${reservation.user.lastName || ''}`.trim() : '';
      const equipmentName = reservation.equipment?.name || '';
      
      return (
        userName.toLowerCase().includes(searchString) ||
        equipmentName.toLowerCase().includes(searchString) ||
        reservation.id.toLowerCase().includes(searchString)
      );
    })
    .filter(reservation => {
      if (filterStatus === 'all') return true;
      return reservation.status === filterStatus;
    });

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentReservations = filteredReservations.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredReservations.length / itemsPerPage);

  return (
    <div className="min-vh-100 bg-light">
      <ToastContainer />
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-auto px-0 bg-dark text-white min-vh-100" style={{ width: '250px' }}>
            <div className="p-3 d-flex flex-column h-100">
              <div>
                <h5 className="mb-4 py-3 border-bottom">
                  <i className="bi bi-grid-fill me-2"></i>
                  LabRES Admin
                </h5>
                <div className="nav flex-column nav-pills">
                  <Link href="/admin/dashboard" className="nav-link active text-white mb-2 d-flex align-items-center">
                    <FiHome className="me-2" /> Dashboard
                  </Link>
                  <Link href="/admin/equipment" className="nav-link text-white mb-2 d-flex align-items-center">
                    <FiBox className="me-2" /> Equipment
                  </Link>
                  <Link href="/admin/reservations" className="nav-link text-white mb-2 d-flex align-items-center">
                    <FiCalendar className="me-2" /> Reservations
                  </Link>
                  <Link href="/admin/users" className="nav-link text-white mb-2 d-flex align-items-center">
                    <FiUsers className="me-2" /> Users
                  </Link>
                  <Link href="/admin/messages" className="nav-link text-white mb-2 d-flex align-items-center">
                    <FiMessageSquare className="me-2" /> Messages
                  </Link>
                </div>
              </div>
              <div className="mt-auto pt-3 border-top">
                <Link href="/" className="nav-link text-white d-flex align-items-center">
                  <i className="bi bi-arrow-left me-2"></i> Back to App
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col ps-md-2 pt-2">
            {/* Header */}
            <div className="container-fluid">
              <div className="card shadow-sm mb-4 border-0">
                <div className="card-body bg-gradient bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="mb-1 fw-bold text-primary">Dashboard Overview</h4>
                      <p className="text-muted mb-0">Welcome to your admin control panel</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="container-fluid">
              {/* Statistics Cards */}
              <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="text-muted mb-2">Total Reservations</h6>
                          <h4 className="mb-0">{stats.totalReservations}</h4>
                        </div>
                        <div className="flex-shrink-0 text-primary">
                          <FiCalendar size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="text-muted mb-2">Pending Approvals</h6>
                          <h4 className="mb-0">{stats.pendingApprovals}</h4>
                        </div>
                        <div className="flex-shrink-0 text-warning">
                          <FiClock size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="text-muted mb-2">Active Reservations</h6>
                          <h4 className="mb-0">{stats.activeReservations}</h4>
                        </div>
                        <div className="flex-shrink-0 text-success">
                          <FiCheckCircle size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="text-muted mb-2">Available Equipment</h6>
                          <h4 className="mb-0">{stats.availableEquipment} / {stats.totalEquipment}</h4>
                        </div>
                        <div className="flex-shrink-0 text-info">
                          <FiBox size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar View */}
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-4">Reservation Calendar</h5>
                  <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    height="auto"
                    eventTimeFormat={{
                      hour: '2-digit',
                      minute: '2-digit',
                      meridiem: false,
                      hour12: false
                    }}
                  />
                </div>
              </div>

              {/* Filters and Table */}
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title mb-0">Recent Reservations</h5>
                    <div className="d-flex gap-3">
                      <select
                        className="form-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="FINISHED">Finished</option>
                      </select>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                          <th>Equipment</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentReservations.map((reservation) => (
                          <tr key={reservation.id}>
                            <td>{reservation.id}</td>
                            <td>{reservation.user?.name || 'Unknown'}</td>
                            <td>{reservation.equipment?.name || 'Unknown'}</td>
                            <td>{new Date(reservation.startDate).toLocaleString()}</td>
                            <td>{new Date(reservation.endDate).toLocaleString()}</td>
                            <td>
                              <span className={`badge bg-${getStatusColor(reservation.status)}`}>
                                {reservation.status}
                              </span>
                            </td>
                            <td>
                              {reservation.status === 'PENDING' && (
                                <div className="btn-group">
                                  <button
                                    onClick={() => handleStatusChange(reservation.id, 'APPROVED')}
                                    className="btn btn-sm btn-success"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(reservation.id, 'REJECTED')}
                                    className="btn btn-sm btn-danger"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <ReactPaginate
                    previousLabel={'Previous'}
                    nextLabel={'Next'}
                    breakLabel={'...'}
                    pageCount={pageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageChange}
                    containerClassName={'pagination justify-content-center mt-4'}
                    pageClassName={'page-item'}
                    pageLinkClassName={'page-link'}
                    previousClassName={'page-item'}
                    previousLinkClassName={'page-link'}
                    nextClassName={'page-item'}
                    nextLinkClassName={'page-link'}
                    breakClassName={'page-item'}
                    breakLinkClassName={'page-link'}
                    activeClassName={'active'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    case 'ONGOING':
      return 'info';
    case 'FINISHED':
      return 'secondary';
    default:
      return 'primary';
  }
}
