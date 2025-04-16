import React from 'react';
import { FiHome, FiBox, FiCalendar, FiUsers, FiMessageSquare } from 'react-icons/fi';
import Link from 'next/link';
import UserManagement from '@/components/admin/UserManagement';

const UsersPage: React.FC = () => {
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
                <Link href="/admin/users" className="nav-link active text-white mb-2 d-flex align-items-center">
                  <FiUsers className="me-2" /> Users
                </Link>
                <Link href="/admin/messages" className="nav-link text-white mb-2 d-flex align-items-center">
                  <FiMessageSquare className="me-2" /> Messages
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col ps-md-2 pt-2">
            <div className="container-fluid">
              <UserManagement />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
