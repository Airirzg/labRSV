import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/middleware/auth';
import ReservationForm from '@/components/ReservationForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import { showToast } from '@/utils/notifications';
import Head from 'next/head';
import ImageCarousel from '@/components/ImageCarousel';
import { Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaTools, FaInfoCircle, FaClipboardList } from 'react-icons/fa';

interface Equipment {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'available' | 'in-use' | 'maintenance';
  lastMaintenance: string;
  imageUrl?: string | null;
  imageUrls?: string[];
}

const CreateReservation = () => {
  const router = useRouter();
  const { equipmentId } = router.query;
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!equipmentId) return;

      try {
        const response = await fetch(`/api/equipment/${equipmentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch equipment details');
        }
        const data = await response.json();
        setEquipment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load equipment');
        console.error('Error fetching equipment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [equipmentId]);

  const handleReservationSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!equipment) {
        throw new Error('Equipment details not loaded');
      }

      // Log the data being sent
      console.log('Submitting reservation with data:', {
        equipmentId: equipment.id,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes
      });

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipmentId: equipment.id,
          startDate: data.startDate,
          endDate: data.endDate,
          notes: data.notes || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        throw new Error(errorData.message || 'Failed to create reservation');
      }

      const result = await response.json();
      console.log('Reservation created:', result);

      // Show success message
      showToast('Reservation created successfully', 'success');

      // Redirect to dashboard after successful reservation
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reservation';
      console.error('Reservation error:', err);
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading equipment details..." />;
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-light">
        <Navbar />
        <main className="container py-5">
          <div className="alert alert-danger">
            Equipment not found or not available for reservation.
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Helper function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'in-use':
        return 'warning';
      case 'maintenance':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen reservation-page">
      <Head>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Navbar />
      
      <div className="page-header">
        <div className="container">
          <h1 className="text-white mb-0">Reserve Equipment</h1>
          <div className="breadcrumb-container">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent mb-0 p-0">
                <li className="breadcrumb-item"><a href="/dashboard" className="text-white-50">Dashboard</a></li>
                <li className="breadcrumb-item"><a href="/equipment" className="text-white-50">Equipment</a></li>
                <li className="breadcrumb-item active text-white" aria-current="page">Reserve</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      
      <main className="container py-5">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className="card shadow-lg border-0 rounded-lg overflow-hidden animate-card">
              <div className="card-header bg-white py-3 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h2 className="card-title h4 mb-0 text-primary">{equipment.name}</h2>
                  <Badge bg={getStatusBadgeColor(equipment.status)} className={`badge badge-${getStatusBadgeColor(equipment.status)} animate-badge`}>
                    {equipment.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-md-6">
                    {/* Equipment Images Carousel */}
                    {(equipment.imageUrl || (equipment.imageUrls && equipment.imageUrls.length > 0)) && (
                      <div className="mb-4 carousel-container">
                        <ImageCarousel 
                          images={[
                            ...(equipment.imageUrl ? [equipment.imageUrl] : []),
                            ...(equipment.imageUrls || [])
                          ]}
                          altText={equipment.name}
                          height={300}
                          autoPlay={true}
                          showControls={true}
                          showIndicators={true}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <div className="equipment-details p-4 rounded mb-4">
                      <h3 className="h5 mb-4 d-flex align-items-center">
                        <FaInfoCircle className="text-primary mr-2" />
                        <span>Equipment Details</span>
                      </h3>
                      
                      <div className="detail-item">
                        <div className="detail-label">Type</div>
                        <div className="detail-value">{equipment.type}</div>
                      </div>
                      
                      <div className="detail-item">
                        <div className="detail-label">
                          <FaTools className="mr-2" />
                          Last Maintenance
                        </div>
                        <div className="detail-value">
                          {new Date(equipment.lastMaintenance).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <div className="detail-item description-item">
                        <div className="detail-label">Description</div>
                        <div className="detail-value description-box">
                          {equipment.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 reservation-form-container">
                  <h3 className="h5 mb-4 d-flex align-items-center">
                    <FaCalendarAlt className="text-primary mr-2" />
                    <span>Reservation Details</span>
                  </h3>
                  <ErrorMessage error={error} />
                  <ReservationForm onSubmit={handleReservationSubmit} />
                </div>
              </div>
              <div className="card-footer bg-light py-3 border-top">
                <div className="d-flex align-items-center">
                  <FaClipboardList className="text-muted mr-2" />
                  <small className="text-muted">Please review all details before submitting your reservation</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Custom styles */}
      <style jsx global>{`
        /* General styling */
        body {
          font-family: 'Poppins', sans-serif;
        }
        
        .reservation-page {
          background-color: #f8f9fa;
          background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
        }
        
        /* Page header */
        .page-header {
          background: linear-gradient(135deg, #4a6bff 0%, #2541b2 100%);
          padding: 2rem 0;
          margin-bottom: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        /* Card animations */
        .animate-card {
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }
        
        .animate-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        /* Badge animations */
        .animate-badge {
          transition: all 0.3s ease;
        }
        
        .animate-badge:hover {
          transform: scale(1.05);
        }
        
        /* Carousel styling */
        .carousel-container {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }
        
        .carousel-container:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
        }
        
        .carousel-control-prev,
        .carousel-control-next {
          background-color: rgba(0, 0, 0, 0.3);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
          margin: 0 10px;
          opacity: 0;
          transition: all 0.3s ease;
        }
        
        .carousel-container:hover .carousel-control-prev,
        .carousel-container:hover .carousel-control-next {
          opacity: 1;
        }
        
        .carousel-indicators {
          margin-bottom: 0.5rem;
        }
        
        .carousel-indicators button {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin: 0 5px;
          background-color: rgba(0, 0, 0, 0.5);
          transition: all 0.3s ease;
        }
        
        .carousel-indicators button.active {
          background-color: #4a6bff;
          transform: scale(1.2);
        }
        
        /* Equipment details styling */
        .equipment-details {
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .equipment-details:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }
        
        .detail-item {
          margin-bottom: 1.2rem;
          padding-bottom: 1.2rem;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
        }
        
        .detail-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .detail-label {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }
        
        .detail-value {
          font-weight: 500;
          color: #343a40;
        }
        
        .description-box {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 6px;
          font-weight: normal;
          line-height: 1.6;
        }
        
        /* Reservation form styling */
        .reservation-form-container {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        /* Badge styling */
        .badge {
          padding: 0.5em 0.75em;
          font-weight: 500;
          text-transform: capitalize;
          letter-spacing: 0.5px;
        }
        
        /* Breadcrumb styling */
        .breadcrumb-item + .breadcrumb-item::before {
          color: rgba(255, 255, 255, 0.5);
        }
        
        /* Button styling */
        .btn-primary {
          background: linear-gradient(135deg, #4a6bff 0%, #2541b2 100%);
          border: none;
          box-shadow: 0 4px 10px rgba(74, 107, 255, 0.3);
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(74, 107, 255, 0.4);
        }
        
        /* Form control styling */
        .form-control:focus {
          border-color: #4a6bff;
          box-shadow: 0 0 0 0.2rem rgba(74, 107, 255, 0.25);
        }
      `}</style>
    </div>
  );
};

export default withAuth(CreateReservation);
