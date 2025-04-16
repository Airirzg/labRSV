import React, { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ReservationStatus } from '@prisma/client';
import ReactPaginate from 'react-paginate';
import { showToast } from '@/utils/notifications';
import { Reservation, PaginatedResponse } from '@/types';

const statusColors: Record<ReservationStatus, string> = {
  PENDING: '#ffd700',
  APPROVED: '#4caf50',
  REJECTED: '#f44336',
  ONGOING: '#2196f3',
  FINISHED: '#9e9e9e',
};

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  extendedProps: {
    status: ReservationStatus;
    equipment: string;
    user: string | undefined;
  };
}

const ReservationManagement: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const itemsPerPage = 10;

  const fetchReservations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        page: String(currentPage + 1),
        limit: String(itemsPerPage),
        status: filter,
        search: searchTerm
      });

      const response = await fetch(
        `/api/admin/reservations?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      setReservations(data.items || []);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      showToast(err instanceof Error ? err.message : 'Failed to fetch reservations', 'error');
      setReservations([]);
      setTotalPages(0);
      setIsLoading(false);
    }
  }, [currentPage, filter, searchTerm, itemsPerPage]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const connectSSE = useCallback(() => {
    if (eventSource) {
      eventSource.close();
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Authentication required', 'error');
        return;
      }

      // Check if we should attempt SSE connection
      const enableSSE = false; // Disable SSE temporarily
      
      if (!enableSSE) {
        console.log('SSE connections are temporarily disabled');
        return;
      }
      
      const newEventSource = new EventSource(`/api/admin/sse?token=${encodeURIComponent(token)}`);

      newEventSource.onopen = () => {
        console.log('SSE connection opened');
        setIsConnected(true);
        setReconnectAttempts(0);
        showToast('Connected to real-time updates', 'success');
      };

      newEventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE message received:', data);

          switch (data.type) {
            case 'connected':
              console.log('SSE connected:', data.message);
              break;

            case 'heartbeat':
              setReconnectAttempts(0);
              break;

            case 'reservationUpdate':
              setReservations(prevReservations => 
                prevReservations.map(res => 
                  res.id === data.reservation.id ? { ...res, ...data.reservation } : res
                )
              );
              showToast(`Reservation ${data.reservation.id} has been updated`, 'info');
              break;

            default:
              console.log('Unknown SSE message type:', data.type);
          }
        } catch (err) {
          console.error('Error processing SSE message:', err);
        }
      };

      newEventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        setIsConnected(false);
        newEventSource.close();
        
        if (reconnectAttempts < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          showToast(`Connection lost. Retrying in ${timeout/1000} seconds...`, 'info');
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectSSE();
          }, timeout);
        } else {
          showToast('Could not establish connection. Please refresh the page.', 'error');
        }
      };

      setEventSource(newEventSource);
    } catch (error) {
      console.error('Error setting up SSE:', error);
      showToast('Failed to connect to real-time updates', 'error');
    }
  }, [reconnectAttempts]);

  useEffect(() => {
    connectSSE();
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectSSE]);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  const handleFilterChange = (status: ReservationStatus | 'ALL') => {
    setFilter(status);
    setCurrentPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0);
  };

  const handleStatusChange = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Update reservation status
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update reservation status');
      }

      const updatedReservation = await response.json();
      
      // Update local state
      setReservations(prevReservations =>
        prevReservations.map(res =>
          res.id === updatedReservation.id ? updatedReservation : res
        )
      );

      showToast(`Reservation status updated to ${newStatus}`, 'success');
      
    } catch (err) {
      console.error('Error updating reservation status:', err);
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const calendarEvents: CalendarEvent[] = (reservations || []).map(reservation => ({
    id: reservation.id,
    title: `${reservation.equipment?.name || 'Unknown'} - ${reservation.user?.email || 'Unknown'}`,
    start: new Date(reservation.startDate).toISOString(),
    end: new Date(reservation.endDate).toISOString(),
    backgroundColor: statusColors[reservation.status] || statusColors.PENDING,
    extendedProps: {
      status: reservation.status,
      equipment: reservation.equipment?.name,
      user: reservation.user?.email,
    }
  }));

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Reservation Calendar</h5>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={calendarEvents}
                height="auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">Reservation List</h5>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <select
                    className="form-select"
                    value={filter}
                    onChange={(e) => handleFilterChange(e.target.value as ReservationStatus | 'ALL')}
                  >
                    <option value="ALL">All Status</option>
                    {Object.keys(statusColors).map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Equipment</th>
                      <th>User</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reservations || []).map(reservation => (
                      <tr key={reservation.id}>
                        <td>
                          <div>{reservation.equipment?.name || 'Unknown Equipment'}</div>
                          <small className="text-muted">{reservation.equipment?.category?.name}</small>
                        </td>
                        <td>
                          <div>{reservation.user?.email || 'Unknown User'}</div>
                          <small className="text-muted">
                            {reservation.user?.firstName} {reservation.user?.lastName}
                          </small>
                        </td>
                        <td>{new Date(reservation.startDate).toLocaleString()}</td>
                        <td>{new Date(reservation.endDate).toLocaleString()}</td>
                        <td>
                          <span
                            className="badge"
                            style={{ backgroundColor: statusColors[reservation.status] || statusColors.PENDING }}
                          >
                            {reservation.status || 'PENDING'}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleStatusChange(reservation.id, 'APPROVED')}
                              disabled={reservation.status === 'APPROVED'}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleStatusChange(reservation.id, 'REJECTED')}
                              disabled={reservation.status === 'REJECTED'}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-center mt-4">
                <ReactPaginate
                  previousLabel="Previous"
                  nextLabel="Next"
                  pageCount={totalPages}
                  onPageChange={handlePageChange}
                  containerClassName="pagination"
                  previousClassName="page-item"
                  nextClassName="page-item"
                  pageClassName="page-item"
                  pageLinkClassName="page-link"
                  previousLinkClassName="page-link"
                  nextLinkClassName="page-link"
                  activeClassName="active"
                  forcePage={currentPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationManagement;
