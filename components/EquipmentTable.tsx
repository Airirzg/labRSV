import { Booking } from '@/types/booking';
import ErrorMessage from '@/components/ErrorMessage';

interface EquipmentTableProps {
  bookings: Booking[];
  loading: boolean;
  error?: string | null;
}

export default function EquipmentTable({ bookings, loading, error }: EquipmentTableProps) {
  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (loading) {
    return (
      <div className="card shadow-sm p-4 mb-4">
        <div className="d-flex justify-content-center align-items-center p-4">
          <div className="spinner-border text-primary me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>Loading bookings...</span>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="card shadow-sm p-4 mb-4">
        <div className="alert alert-info mb-0">
          You haven't made any equipment reservations yet.
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="mb-4">My Bookings</h3>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Equipment</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.equipment}</td>
                  <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                  <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge bg-${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    default:
      return 'secondary';
  }
}
