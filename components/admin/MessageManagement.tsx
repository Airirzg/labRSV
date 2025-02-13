import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { showToast } from '@/utils/notifications';

interface Message {
  id: string;
  subject: string;
  content: string;
  senderEmail: string;
  senderName: string;
  status: 'UNREAD' | 'READ';
  createdAt: Date;
}

interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
}

const MessageManagement: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMessages();
  }, [currentPage, searchTerm, filter]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: filter !== 'ALL' ? filter : '',
      });

      const response = await fetch(`/api/admin/messages?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data: PaginatedResponse<Message> = await response.json();
      setMessages(data.items || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast('Failed to fetch messages', 'error');
      setMessages([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ' }),
      });

      if (!response.ok) throw new Error('Failed to update message status');
      
      showToast('Message marked as read', 'success');
      fetchMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      showToast('Failed to update message status', 'error');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete message');
      
      showToast('Message deleted successfully', 'success');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      showToast('Failed to delete message', 'error');
    }
  };

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
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'ALL' | 'UNREAD' | 'READ')}
              className="form-select"
              style={{ width: 'auto' }}
            >
              <option value="ALL">All Messages</option>
              <option value="UNREAD">Unread</option>
              <option value="READ">Read</option>
            </select>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ width: 'auto' }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {messages.length === 0 ? (
            <p className="text-center text-muted py-4">No messages found</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Sender</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td>{message.subject}</td>
                      <td>
                        <div>{message.senderName}</div>
                        <small className="text-muted">{message.senderEmail}</small>
                      </td>
                      <td>
                        <span className={`badge bg-${message.status === 'UNREAD' ? 'danger' : 'success'}`}>
                          {message.status}
                        </span>
                      </td>
                      <td>{new Date(message.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="btn-group">
                          <button
                            onClick={() => {
                              setSelectedMessage(message);
                              setIsModalOpen(true);
                              if (message.status === 'UNREAD') {
                                handleMarkAsRead(message.id);
                              }
                            }}
                            className="btn btn-sm btn-primary"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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

      {/* Message Details Modal */}
      {isModalOpen && selectedMessage && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedMessage.subject}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedMessage(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <strong>From:</strong> {selectedMessage.senderName} ({selectedMessage.senderEmail})
                  </div>
                  <div className="mb-3">
                    <strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                  <div className="mb-3">
                    <strong>Message:</strong>
                    <div className="mt-2 p-3 bg-light rounded">
                      {selectedMessage.content}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedMessage(null);
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      handleDeleteMessage(selectedMessage.id);
                      setIsModalOpen(false);
                      setSelectedMessage(null);
                    }}
                  >
                    Delete Message
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default MessageManagement;
