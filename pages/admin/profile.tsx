import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiHome, FiBox, FiCalendar, FiUsers, FiMessageSquare, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { showToast } from '@/utils/notifications';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  createdAt: Date;
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
              <h5 className="mb-4 py-3 border-bottom">
                <i className="bi bi-grid-fill me-2"></i>
                LabRES Admin
              </h5>
              <div className="nav flex-column nav-pills">
                <Link href="/admin/dashboard" className="nav-link text-white mb-2 d-flex align-items-center">
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
                <Link href="/admin/profile" className="nav-link active text-white mb-2 d-flex align-items-center">
                  <FiUser className="me-2" /> Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col ps-md-2 pt-2">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0">Admin Profile</h5>
                        {!isEditing && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setIsEditing(true)}
                          >
                            Edit Profile
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="card-body">
                      {profile ? (
                        isEditing ? (
                          <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                              <label className="form-label">Name</label>
                              <input
                                type="text"
                                className="form-control"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Email</label>
                              <input
                                type="email"
                                className="form-control"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                              />
                            </div>
                            <div className="d-flex gap-2">
                              <button type="submit" className="btn btn-primary">
                                Save Changes
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                  setIsEditing(false);
                                  setFormData({
                                    name: profile.name,
                                    email: profile.email,
                                  });
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div>
                            <div className="text-center mb-4">
                              {profile.image ? (
                                <img
                                  src={profile.image}
                                  alt={profile.name}
                                  className="rounded-circle"
                                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                                  style={{ width: '120px', height: '120px', fontSize: '2.5rem' }}
                                >
                                  {profile.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <h6 className="text-muted">Name</h6>
                                <p className="mb-0">{profile.name}</p>
                              </div>
                              <div className="col-md-6 mb-3">
                                <h6 className="text-muted">Email</h6>
                                <p className="mb-0">{profile.email}</p>
                              </div>
                              <div className="col-md-6 mb-3">
                                <h6 className="text-muted">Role</h6>
                                <p className="mb-0">
                                  <span className="badge bg-primary">{profile.role}</span>
                                </p>
                              </div>
                              <div className="col-md-6 mb-3">
                                <h6 className="text-muted">Member Since</h6>
                                <p className="mb-0">
                                  {new Date(profile.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
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
    </div>
  );
};

export default AdminProfilePage;
