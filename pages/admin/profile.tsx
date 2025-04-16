import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiHome, FiBox, FiCalendar, FiUsers, FiMessageSquare, FiUser, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { showToast } from '@/utils/notifications';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  createdAt: string | Date;
}

const AdminProfilePage: React.FC = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await fetch('/api/admin/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name,
        email: data.email,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Failed to fetch profile', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-auto px-0 bg-dark text-white min-vh-100" style={{ width: '250px' }}>
            <div className="p-3">
              <h5 className="mb-4 py-3 border-bottom d-flex align-items-center">
                <i className="bi bi-grid-fill me-2"></i>
                <span className="fw-bold">LabRES Admin</span>
              </h5>
              <div className="nav flex-column nav-pills">
                <Link href="/admin/dashboard" className="nav-link text-white-50 mb-2 d-flex align-items-center rounded py-2 px-3 hover-nav">
                  <FiHome className="me-2" /> Dashboard
                </Link>
                <Link href="/admin/equipment" className="nav-link text-white-50 mb-2 d-flex align-items-center rounded py-2 px-3 hover-nav">
                  <FiBox className="me-2" /> Equipment
                </Link>
                <Link href="/admin/reservations" className="nav-link text-white-50 mb-2 d-flex align-items-center rounded py-2 px-3 hover-nav">
                  <FiCalendar className="me-2" /> Reservations
                </Link>
                <Link href="/admin/users" className="nav-link text-white-50 mb-2 d-flex align-items-center rounded py-2 px-3 hover-nav">
                  <FiUsers className="me-2" /> Users
                </Link>
                <Link href="/admin/messages" className="nav-link text-white-50 mb-2 d-flex align-items-center rounded py-2 px-3 hover-nav">
                  <FiMessageSquare className="me-2" /> Messages
                </Link>
                <Link href="/admin/profile" className="nav-link active bg-primary text-white mb-2 d-flex align-items-center rounded py-2 px-3 shadow-sm">
                  <FiUser className="me-2" /> Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col ps-md-2 pt-4">
            <div className="container-fluid">
              <div className="row justify-content-center">
                <div className="col-lg-10">
                  <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                    <div className="card-header bg-white p-4 border-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="card-title fw-bold mb-0 d-flex align-items-center">
                          <FiUser className="me-2 text-primary" /> Admin Profile
                        </h5>
                        {!isEditing && (
                          <button
                            className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center"
                            onClick={() => setIsEditing(true)}
                          >
                            <FiEdit2 className="me-2" /> Edit Profile
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="card-body p-4">
                      {profile ? (
                        isEditing ? (
                          <form onSubmit={handleSubmit} className="p-2">
                            <div className="mb-4">
                              <label className="form-label fw-medium">Name</label>
                              <input
                                type="text"
                                className="form-control form-control-lg rounded-3 border-light-subtle"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{ backgroundColor: '#f8f9fa' }}
                              />
                            </div>
                            <div className="mb-4">
                              <label className="form-label fw-medium">Email</label>
                              <input
                                type="email"
                                className="form-control form-control-lg rounded-3 border-light-subtle"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                style={{ backgroundColor: '#f8f9fa' }}
                              />
                            </div>
                            <div className="d-flex gap-2 mt-4">
                              <button type="submit" className="btn btn-primary px-4 py-2 rounded-pill d-flex align-items-center">
                                <FiSave className="me-2" /> Save Changes
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary px-4 py-2 rounded-pill d-flex align-items-center"
                                onClick={() => {
                                  setIsEditing(false);
                                  setFormData({
                                    name: profile.name,
                                    email: profile.email,
                                  });
                                }}
                              >
                                <FiX className="me-2" /> Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="p-2">
                            <div className="text-center mb-5 position-relative">
                              <div className="profile-header bg-primary position-absolute top-0 start-0 end-0" style={{ height: '80px', marginTop: '-1.5rem' }}></div>
                              {profile.image ? (
                                <img
                                  src={profile.image}
                                  alt={profile.name}
                                  className="rounded-circle border-4 border-white shadow-sm position-relative"
                                  style={{ width: '150px', height: '150px', objectFit: 'cover', marginTop: '10px' }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto border-4 border-white shadow-sm position-relative"
                                  style={{ width: '150px', height: '150px', fontSize: '3.5rem', marginTop: '10px' }}
                                >
                                  {profile.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <h3 className="mt-4 mb-1 fw-bold">{profile.name}</h3>
                              <p className="text-muted mb-0">{profile.email}</p>
                            </div>
                            
                            <div className="row mt-4 g-4">
                              <div className="col-md-6">
                                <div className="info-card p-4 rounded-3 h-100" style={{ backgroundColor: 'rgba(108, 92, 231, 0.05)' }}>
                                  <h6 className="text-muted mb-3 d-flex align-items-center">
                                    <i className="bi bi-person-badge me-2"></i> Role
                                  </h6>
                                  <div className="d-flex align-items-center">
                                    <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">{profile.role}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="info-card p-4 rounded-3 h-100" style={{ backgroundColor: 'rgba(0, 206, 201, 0.05)' }}>
                                  <h6 className="text-muted mb-3 d-flex align-items-center">
                                    <i className="bi bi-calendar-check me-2"></i> Member Since
                                  </h6>
                                  <div className="d-flex align-items-center">
                                    <span className="fs-6">{new Date(profile.createdAt).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="col-12 mt-4">
                                <div className="info-card p-4 rounded-3" style={{ backgroundColor: 'rgba(9, 132, 227, 0.05)' }}>
                                  <h6 className="text-muted mb-3">Account Security</h6>
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                      <p className="mb-0">Password</p>
                                      <small className="text-muted">Last changed: Never</small>
                                    </div>
                                    <button className="btn btn-outline-primary btn-sm rounded-pill px-3">
                                      Change Password
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-3 text-muted">Loading profile information...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .hover-nav:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: white !important;
          transition: all 0.3s ease;
        }
        .border-4 {
          border-width: 4px !important;
          border-style: solid;
        }
      `}</style>
    </div>
  );
};

export default AdminProfilePage;
