import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useDispatch } from 'react-redux';
import { addReservation } from '@/store/slices/reservationSlice';
import { useAuth } from '@/context/AuthContext';
import "react-datepicker/dist/react-datepicker.css";

interface ReservationData {
  startDate: string;
  endDate: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ReservationFormProps {
  onSubmit?: (data: ReservationData) => void;
}

const ReservationForm = ({ onSubmit }: ReservationFormProps) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (startDate > endDate) {
      setError('End date must be after start date');
      return;
    }

    const reservationData: ReservationData = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      notes,
      status: 'pending',
    };

    try {
      // Handle form submission
      if (onSubmit) {
        await onSubmit(reservationData);
      }
      
      dispatch(addReservation({
        id: Date.now(), // Temporary ID for demo
        ...reservationData,
        userId: user?.id || '', // Get user ID from auth context
      }));

      // Reset form
      setStartDate(null);
      setEndDate(null);
      setNotes('');
    } catch (err) {
      setError('Failed to create reservation. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
      <h3 className="mb-4">Create New Reservation</h3>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Start Date</label>
        <DatePicker
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
          className="form-control"
          dateFormat="MMMM d, yyyy"
          minDate={new Date()}
          placeholderText="Select start date"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">End Date</label>
        <DatePicker
          selected={endDate}
          onChange={(date: Date) => setEndDate(date)}
          className="form-control"
          dateFormat="MMMM d, yyyy"
          minDate={startDate || new Date()}
          placeholderText="Select end date"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Notes (Optional)</label>
        <textarea
          className="form-control"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Add any special requests or notes here..."
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Create Reservation
      </button>
    </form>
  );
};

export default ReservationForm;
