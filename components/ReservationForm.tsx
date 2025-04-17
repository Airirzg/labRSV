import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useDispatch } from 'react-redux';
import { addReservation } from '@/store/slices/reservationSlice';
import { useAuth } from '@/context/AuthContext';
import "react-datepicker/dist/react-datepicker.css";
import { 
  FaCalendarAlt, 
  FaRegClock, 
  FaRegStickyNote, 
  FaArrowRight, 
  FaInfoCircle,
  FaCheck
} from 'react-icons/fa';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Date selection, 2: Notes, 3: Confirmation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      setIsSubmitting(false);
      return;
    }

    if (startDate > endDate) {
      setError('End date must be after start date');
      setIsSubmitting(false);
      return;
    }

    // Format dates to match the server's expected format
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();

    const reservationData: ReservationData = {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      notes: notes || '',
      status: 'PENDING', // Match the server's enum case
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
      setStep(1);
    } catch (err) {
      setError('Failed to create reservation. Please try again.');
      console.error('Reservation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate the duration between start and end dates
  const calculateDuration = () => {
    if (!startDate || !endDate) return null;
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const duration = calculateDuration();

  const nextStep = () => {
    if (step === 1 && (!startDate || !endDate)) {
      setError('Please select both start and end dates');
      return;
    }
    
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="reservation-form-wrapper">
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="form-progress-container">
        <div className="form-progress">
          <div 
            className={`progress-step ${step >= 1 ? 'active' : ''}`}
            onClick={() => step > 1 && setStep(1)}
          >
            <div className="step-number">1</div>
            <div className="step-label">Date Selection</div>
          </div>
          <div className="progress-line"></div>
          <div 
            className={`progress-step ${step >= 2 ? 'active' : ''}`}
            onClick={() => step > 2 && setStep(2)}
          >
            <div className="step-number">2</div>
            <div className="step-label">Additional Info</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Confirmation</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="reservation-form">
        {step === 1 && (
          <div className="form-step date-step">
            <h3 className="step-title">
              <FaCalendarAlt className="step-icon" />
              Select Reservation Dates
            </h3>
            
            <div className="date-selection-container">
              <div className="date-picker-wrapper">
                <div className="date-picker-group start-date">
                  <div className="date-header">
                    <div className="date-icon-wrapper">
                      <FaCalendarAlt className="date-icon-large" />
                    </div>
                    <div className="date-header-content">
                      <label className="date-label">Start Date & Time</label>
                      <p className="date-helper">When would you like to start using the equipment?</p>
                    </div>
                  </div>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date) => setStartDate(date)}
                    className="date-input"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    placeholderText="Select start date and time"
                    required
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    timeCaption="Time"
                    calendarClassName="custom-datepicker-calendar"
                  />
                  {startDate && (
                    <div className="selected-date-display">
                      <div className="selected-date-day">{startDate.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                      <div className="selected-date-full">
                        {startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        <span className="selected-date-time"> at {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="date-connector">
                  <div className="connector-line"></div>
                  <div className="connector-circle">
                    <FaArrowRight className="arrow-icon" />
                  </div>
                  <div className="connector-line"></div>
                </div>

                <div className="date-picker-group end-date">
                  <div className="date-header">
                    <div className="date-icon-wrapper end-icon">
                      <FaRegClock className="date-icon-large" />
                    </div>
                    <div className="date-header-content">
                      <label className="date-label">End Date & Time</label>
                      <p className="date-helper">When will you return the equipment?</p>
                    </div>
                  </div>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date) => setEndDate(date)}
                    className="date-input"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={startDate || new Date()}
                    placeholderText="Select end date and time"
                    required
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    timeCaption="Time"
                    calendarClassName="custom-datepicker-calendar"
                  />
                  {endDate && (
                    <div className="selected-date-display">
                      <div className="selected-date-day">{endDate.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                      <div className="selected-date-full">
                        {endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        <span className="selected-date-time"> at {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="date-summary">
              {startDate && endDate && (
                <div className="date-summary-content">
                  <div className="summary-icon">
                    <FaInfoCircle />
                  </div>
                  <div className="summary-text">
                    Your reservation will last for <strong>{duration} {duration === 1 ? 'day' : 'days'}</strong>, 
                    from <strong>{formatDate(startDate)}</strong> to <strong>{formatDate(endDate)}</strong>.
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="next-button"
                onClick={nextStep}
              >
                Continue to Additional Info
              </button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="form-step notes-step">
            <h3 className="step-title">
              <FaRegStickyNote className="step-icon" />
              Additional Information
            </h3>
            
            <div className="notes-container">
              <label className="notes-label">
                <FaRegStickyNote className="notes-icon" />
                <span>Notes (Optional)</span>
              </label>
              <p className="notes-helper">
                Please provide any special requirements or additional information about your reservation.
              </p>
              <textarea
                className="notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Add any special requests or notes here..."
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="back-button"
                onClick={prevStep}
              >
                Back to Dates
              </button>
              <button 
                type="button" 
                className="next-button"
                onClick={nextStep}
              >
                Review Reservation
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="form-step confirmation-step">
            <h3 className="step-title">
              <FaCheck className="step-icon" />
              Confirm Your Reservation
            </h3>
            
            <div className="confirmation-container">
              <div className="confirmation-card">
                <h4 className="confirmation-section-title">
                  <FaCalendarAlt className="confirmation-icon" />
                  Reservation Details
                </h4>
                
                <div className="confirmation-detail">
                  <div className="detail-label">Start Date & Time:</div>
                  <div className="detail-value">{formatDate(startDate)}</div>
                </div>
                
                <div className="confirmation-detail">
                  <div className="detail-label">End Date & Time:</div>
                  <div className="detail-value">{formatDate(endDate)}</div>
                </div>
                
                <div className="confirmation-detail">
                  <div className="detail-label">Duration:</div>
                  <div className="detail-value">
                    {duration} {duration === 1 ? 'day' : 'days'}
                  </div>
                </div>
                
                {notes && (
                  <div className="confirmation-detail notes-detail">
                    <div className="detail-label">Notes:</div>
                    <div className="detail-value notes-value">{notes}</div>
                  </div>
                )}
                
                <div className="confirmation-info">
                  <FaInfoCircle className="info-icon" />
                  <p>Please review all details before confirming your reservation.</p>
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="back-button"
                onClick={prevStep}
              >
                Back to Additional Info
              </button>
              <button 
                type="submit" 
                className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Reservation...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        )}
      </form>

      <style jsx>{`
        .reservation-form-wrapper {
          width: 100%;
        }

        .form-progress-container {
          margin-bottom: 2rem;
        }

        .form-progress {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          cursor: pointer;
        }

        .progress-step.active .step-number {
          background-color: #4a6bff;
          color: white;
        }

        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #e9ecef;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }

        .step-label {
          font-size: 0.8rem;
          color: #6c757d;
          font-weight: 500;
          text-align: center;
        }

        .progress-line {
          flex-grow: 1;
          height: 3px;
          background-color: #e9ecef;
          margin: 0 0.5rem;
          position: relative;
          top: -18px;
        }

        .step-title {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          color: #343a40;
        }

        .step-icon {
          color: #4a6bff;
          margin-right: 0.75rem;
        }

        .reservation-form {
          display: flex;
          flex-direction: column;
        }

        .form-step {
          background-color: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
        }

        .date-selection-container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .date-picker-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 1.5rem;
          padding: 0.5rem;
        }

        .date-picker-group {
          flex: 1;
          min-width: 200px;
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          position: relative;
        }

        .date-picker-group:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .date-header {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }

        .date-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(74, 107, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
        }

        .end-icon {
          background: rgba(255, 159, 67, 0.1);
        }

        .date-icon-large {
          font-size: 1.5rem;
          color: #4a6bff;
        }

        .end-icon .date-icon-large {
          color: #ff9f43;
        }

        .date-header-content {
          flex: 1;
        }

        .date-label {
          display: block;
          font-weight: 600;
          color: #343a40;
          margin-bottom: 0.25rem;
          font-size: 1.1rem;
        }

        .date-helper {
          color: #6c757d;
          font-size: 0.85rem;
          margin: 0;
        }

        .date-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #ced4da;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.2s ease;
          background-color: #f8f9fa;
        }

        .date-input:focus {
          border-color: #4a6bff;
          box-shadow: 0 0 0 0.2rem rgba(74, 107, 255, 0.25);
          outline: none;
          background-color: white;
        }

        .selected-date-display {
          margin-top: 1rem;
          padding: 0.75rem;
          background-color: #f8f9fa;
          border-radius: 0.5rem;
          border-left: 4px solid #4a6bff;
        }

        .end-date .selected-date-display {
          border-left-color: #ff9f43;
        }

        .selected-date-day {
          font-weight: 600;
          color: #343a40;
          margin-bottom: 0.25rem;
        }

        .selected-date-full {
          color: #495057;
          font-size: 0.9rem;
        }

        .selected-date-time {
          color: #6c757d;
        }

        .date-connector {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 1rem 0;
        }

        .connector-line {
          height: 2px;
          background-color: #e9ecef;
          flex-grow: 1;
        }

        .connector-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4a6bff 0%, #2541b2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 1rem;
          color: white;
          box-shadow: 0 4px 8px rgba(74, 107, 255, 0.3);
        }

        .date-summary {
          margin: 1.5rem 0;
        }

        .date-summary-content {
          display: flex;
          align-items: flex-start;
          background-color: rgba(74, 107, 255, 0.1);
          padding: 1rem;
          border-radius: 0.5rem;
          border-left: 4px solid #4a6bff;
        }

        .summary-icon {
          color: #4a6bff;
          margin-right: 0.75rem;
          margin-top: 0.25rem;
        }

        .summary-text {
          color: #495057;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .notes-container {
          width: 100%;
          margin-bottom: 1.5rem;
        }

        .notes-helper {
          color: #6c757d;
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
        }

        .notes-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #ced4da;
          border-radius: 0.5rem;
          font-size: 1rem;
          resize: vertical;
          min-height: 120px;
          transition: all 0.2s ease;
        }

        .notes-input:focus {
          border-color: #4a6bff;
          box-shadow: 0 0 0 0.2rem rgba(74, 107, 255, 0.25);
          outline: none;
        }

        .confirmation-container {
          margin-bottom: 1.5rem;
        }

        .confirmation-card {
          background-color: #f8f9fa;
          border-radius: 0.5rem;
          padding: 1.5rem;
          border: 1px solid #e9ecef;
        }

        .confirmation-section-title {
          display: flex;
          align-items: center;
          font-size: 1.1rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e9ecef;
        }

        .confirmation-icon {
          color: #4a6bff;
          margin-right: 0.5rem;
        }

        .confirmation-detail {
          display: flex;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .detail-label {
          min-width: 150px;
          font-weight: 500;
          color: #495057;
        }

        .detail-value {
          flex: 1;
          color: #212529;
        }

        .notes-detail {
          flex-direction: column;
        }

        .notes-value {
          background-color: white;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-top: 0.5rem;
          border: 1px solid #e9ecef;
          min-height: 60px;
        }

        .confirmation-info {
          display: flex;
          align-items: flex-start;
          background-color: rgba(74, 107, 255, 0.1);
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-top: 1rem;
        }

        .info-icon {
          color: #4a6bff;
          margin-right: 0.5rem;
          margin-top: 0.25rem;
        }

        .confirmation-info p {
          margin: 0;
          font-size: 0.875rem;
          color: #495057;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .next-button, .submit-button {
          background: linear-gradient(135deg, #4a6bff 0%, #2541b2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(74, 107, 255, 0.2);
        }

        .back-button {
          background: transparent;
          color: #6c757d;
          border: 1px solid #ced4da;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .next-button:hover, .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(74, 107, 255, 0.3);
        }

        .back-button:hover {
          background-color: #f8f9fa;
        }

        .submit-button.submitting {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (min-width: 768px) {
          .date-picker-wrapper {
            flex-direction: row;
            align-items: stretch;
          }

          .date-connector {
            flex-direction: column;
            padding: 0 1rem;
            min-width: 100px;
          }

          .connector-line {
            width: 2px;
            height: auto;
            flex-grow: 1;
          }
        }

        @media (max-width: 768px) {
          .date-picker-wrapper {
            flex-direction: column;
            align-items: stretch;
          }

          .date-connector {
            flex-direction: row;
            justify-content: center;
            padding: 0.5rem 0;
          }

          .connector-line {
            height: 2px;
            width: auto;
            flex-grow: 1;
          }

          .form-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .back-button, .next-button, .submit-button {
            width: 100%;
          }

          .progress-step .step-label {
            font-size: 0.7rem;
          }
        }
      `}</style>

      <style jsx global>{`
        .custom-datepicker-calendar {
          border: none;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          font-family: 'Poppins', sans-serif;
        }

        .react-datepicker__header {
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .react-datepicker__day--selected,
        .react-datepicker__day--in-selecting-range,
        .react-datepicker__day--in-range {
          background-color: #4a6bff;
          border-radius: 0.3rem;
        }

        .react-datepicker__day--keyboard-selected {
          background-color: rgba(74, 107, 255, 0.7);
        }

        .react-datepicker__day:hover {
          background-color: rgba(74, 107, 255, 0.1);
        }

        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
          background-color: #4a6bff;
        }
      `}</style>
    </div>
  );
};

export default ReservationForm;
