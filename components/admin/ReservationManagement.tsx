import React, { useState, useEffect } from 'react';
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
}

const ReservationManagement: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReservations();
  }, [currentPage, filter, searchTerm]);

  useEffect(() => {
    const eventSource = new EventSource('/api/admin/sse');
  
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'reservationUpdate') {
        // Update the specific reservation in the list
        setReservations(prevReservations => 
          prevReservations.map(res => 
            res.id === data.reservation.id ? { ...res, ...data.reservation } : res
          )
        );
        showToast(`Reservation ${data.reservation.id} has been updated`, 'info');
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        filter: filter !== 'ALL' ? filter : '',
        search: searchTerm,
      });

      const response = await fetch(`/api/admin/reservations?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data: PaginatedResponse<Reservation> = await response.json();
      setReservations(data.items || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      showToast('Failed to fetch reservations', 'error');
      setReservations([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const checkReservationConflict = async (equipmentId: string, startDate: string, endDate: string, excludeId?: string) => {
    try {
      const response = await fetch(`/api/admin/reservations/check-conflict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentId, startDate, endDate, excludeId }),
      });
    
      if (!response.ok) throw new Error('Failed to check conflicts');
      const data = await response.json();
      return data.hasConflict;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return true; // Assume conflict on error for safety
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (newStatus === 'APPROVED') {
      const reservation = reservations.find(r => r.id === id);
      if (!reservation) return;

      const hasConflict = await checkReservationConflict(
        reservation.equipmentId,
        reservation.startDate,
        reservation.endDate,
        id
      );

      if (hasConflict) {
        showToast('Cannot approve: Time slot conflicts with another reservation', 'error');
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/reservations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setReservations(prevReservations =>
        prevReservations.map(res =>
          res.id === id ? { ...res, status: newStatus } : res
        )
      );

      showToast(`Reservation status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update reservation status', 'error');
    }
  };

  const calendarEvents: CalendarEvent[] = (reservations || []).map((reservation) => ({
    id: reservation.id,
    title: `${reservation.equipment?.name || 'Unknown Equipment'} - ${
      reservation.user 
        ? `${reservation.user.firstName} ${reservation.user.lastName}`
        : reservation.team?.teamName || 'Unknown User'
    }`,
    start: new Date(reservation.startDate).toISOString(),
    end: new Date(reservation.endDate).toISOString(),
    backgroundColor: statusColors[reservation.status] || statusColors.PENDING,
  }));

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Reservation Requests</h5>
            <div className="d-flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED')}
                className="form-select"
                style={{ width: 'auto' }}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <input
                type="text"
                placeholder="Search by user or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ width: 'auto' }}
              />
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Equipment</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>
                      <div>{reservation.user.firstName} {reservation.user.lastName}</div>
                      <small className="text-muted">{reservation.user.email}</small>
                    </td>
                    <td>{reservation.equipment.name}</td>
                    <td>{new Date(reservation.startDate).toLocaleString()}</td>
                    <td>{new Date(reservation.endDate).toLocaleString()}</td>
                    <td>{reservation.purpose}</td>
                    <td>
                      <span
                        className={`badge bg-${
                          reservation.status === 'APPROVED'
                            ? 'success'
                            : reservation.status === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }`}
                      >
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
                            Accept
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

          {totalPages > 1 && (
            <ReactPaginate
              previousLabel={'Previous'}
              nextLabel={'Next'}
              breakLabel={'...'}
              pageCount={totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={({ selected }) => setCurrentPage(selected)}
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
              disabledClassName={'disabled'}
            />
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Reservation Calendar</h5>
        </div>
        <div className="card-body">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            eventClick={(info) => {
              const reservation = reservations.find((r) => r.id === info.event.id);
              if (reservation) {
                showToast(`Reservation for ${reservation.equipment?.name || 'Unknown Equipment'}`, 'info');
              }
            }}
            style={{
              height: 200,
              fontSize: '0.75rem',
              '.fc-daygrid-body': { padding: '0.25rem' },
              '.fc-header-toolbar': { padding: '0.25rem' },
              '.fc-daygrid-day-frame': { padding: '0.15rem' },
              '.fc-event': { padding: '0.1rem' }
            }}
            eventDisplay="block"
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', omitZeroMinute: false }}
            eventContent={(eventInfo) => (
              <div style={{ fontSize: '0.65rem', padding: '1px' }}>
                {eventInfo.event.title}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ReservationManagement;
