import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
import { z } from 'zod';
import Link from 'next/link';
import { FiHome, FiBox, FiCalendar, FiUsers, FiMessageSquare, FiSettings, FiBell, FiUser } from 'react-icons/fi';
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
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    // Initialize SSE connection
    const eventSource = new EventSource('/api/admin/events');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setReservations(data);
    };

    eventSource.addEventListener('initial', (event) => {
      const data = JSON.parse(event.data);
      setReservations(data);
    });

    eventSource.addEventListener('update', (event) => {
      const updatedReservation = JSON.parse(event.data);
      setReservations(prev => 
        prev.map(res => 
          res.id === updatedReservation.id ? updatedReservation : res
        )
      );
      toast.success('Reservation updated!');
    });

    // Fetch equipment data
    fetch('/api/admin/equipment')
      .then(res => res.json())
      .then(data => setEquipment(data))
      .catch(error => console.error('Error fetching equipment:', error));

    // Fetch admin profile
    fetch('/api/admin/profile')
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          setAdminName(data.name);
        }
      })
      .catch(error => console.error('Error fetching admin profile:', error));

    return () => {
      eventSource.close();
    };
  }, []);

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
    title: `${reservation.equipment.name} - ${reservation.user.name}`,
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
          <p className="mb-2">{reservation.equipment.name} reserved by {reservation.user.name}</p>
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
    .filter((reservation) => {
      if (filterStatus === 'all') return true;
      return reservation.status === filterStatus;
    })
    .filter((reservation) => {
      const searchString = searchTerm.toLowerCase();
      return (
        reservation.user.name.toLowerCase().includes(searchString) ||
        reservation.equipment.name.toLowerCase().includes(searchString) ||
        reservation.id.toLowerCase().includes(searchString)
      );
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
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4 rounded">
              <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center w-100">
                  <h4 className="mb-0">Dashboard Overview</h4>
                  <div className="d-flex align-items-center">
                    <button className="btn btn-link position-relative me-3">
                      <FiBell className="text-muted" size={20} />
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {reservations.filter(r => r.status === 'PENDING').length}
                      </span>
                    </button>
                    <span className="text-primary">{adminName}</span>
                  </div>
                </div>
              </div>
            </nav>

            <div className="container-fluid">
              {/* Statistics Cards */}
              <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="card-subtitle mb-1 text-muted">Total Equipment</h6>
                          <h4 className="card-title mb-0">{equipment.length}</h4>
                        </div>
                        <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                          <FiBox className="text-primary" size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="card-subtitle mb-1 text-muted">Active Reservations</h6>
                          <h4 className="card-title mb-0">
                            {reservations.filter(r => r.status === 'ONGOING').length}
                          </h4>
                        </div>
                        <div className="p-2 bg-success bg-opacity-10 rounded-3">
                          <FiCalendar className="text-success" size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="card-subtitle mb-1 text-muted">Pending Reservations</h6>
                          <h4 className="card-title mb-0">
                            {reservations.filter(r => r.status === 'PENDING').length}
                          </h4>
                        </div>
                        <div className="p-2 bg-warning bg-opacity-10 rounded-3">
                          <FiCalendar className="text-warning" size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="card-subtitle mb-1 text-muted">Completed Reservations</h6>
                          <h4 className="card-title mb-0">
                            {reservations.filter(r => r.status === 'FINISHED').length}
                          </h4>
                        </div>
                        <div className="p-2 bg-info bg-opacity-10 rounded-3">
                          <FiCalendar className="text-info" size={24} />
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
                          <th>Actions</th>
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
