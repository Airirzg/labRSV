import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { showToast } from '@/utils/notifications';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  subject: string;
  content: string;
  senderEmail: string;
  senderName: string;
  status: 'UNREAD' | 'READ';
  createdAt: Date;
  reservationId?: string;
  equipmentName?: string;
  equipmentId?: string;
  replies?: {
    id: string;
    senderName: string;
    content: string;
    createdAt: Date;
  }[];
}

interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
}

const MessageManagement: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user) return;
    fetchMessages();
  }, [currentPage, searchTerm, filter, user]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token || !user) {
        throw new Error('No authentication token found');
      }

      if (user.role !== 'ADMIN') {
        throw new Error('Only administrators can access messages');
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: filter !== 'ALL' ? filter : '',
      });

      const response = await fetch(`/api/admin/messages?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch messages');
      }

      const data: PaginatedResponse<Message> = await response.json();
      setMessages(data.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast(error instanceof Error ? error.message : 'Failed to fetch messages', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        throw new Error('No authentication token found');
      }

      if (user.role !== 'ADMIN') {
        throw new Error('Only administrators can mark messages as read');
      }

      const response = await fetch(`/api/admin/messages/${messageId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'READ' }),
      });

      if (!response.ok) throw new Error('Failed to update message status');
      
      showToast('Message marked as read', 'success');
      fetchMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      showToast(error instanceof Error ? error.message : 'Failed to update message status', 'error');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        throw new Error('No authentication token found');
      }

      if (user.role !== 'ADMIN') {
        throw new Error('Only administrators can delete messages');
      }

      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete message');
      
      showToast('Message deleted successfully', 'success');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      showToast(error instanceof Error ? error.message : 'Failed to delete message', 'error');
    }
  };

  const handleReply = async (message: Message) => {
    setSelectedMessage(message);
    setReplySubject(`Re: ${message.subject}`);
    setIsReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (user.role !== 'ADMIN') {
        throw new Error('Only administrators can send replies');
      }

      const response = await fetch('/api/admin/messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalMessageId: selectedMessage.id,
          subject: replySubject,
          content: replyContent,
        }),
      });

      const data = await response.json();
      console.log('Reply response:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to send reply');
      }

      showToast('Reply sent successfully', 'success');
      setIsReplyModalOpen(false);
      setReplyContent('');
      setReplySubject('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      showToast(error instanceof Error ? error.message : 'Failed to send reply', 'error');
    }
  };

  const renderMessageContent = (message: Message) => {
    return (
      <div className="message-content">
        <div className="message-header mb-2">
          <strong>From:</strong> {message.senderName} ({message.senderEmail})
          {message.equipmentName && (
            <div>
              <strong>Equipment:</strong> {message.equipmentName}
            </div>
          )}
          <div>
            <strong>Date:</strong> {new Date(message.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="message-body">
          <strong>Subject:</strong> {message.subject}
          <p className="mt-2">{message.content}</p>
        </div>
      </div>
    );
  };

  const renderMessageRow = (message: Message) => (
    <tr key={message.id} className={message.status === 'UNREAD' ? 'table-active' : ''}>
      <td>
        <div className="d-flex align-items-center">
          {message.status === 'UNREAD' && (
            <span className="badge bg-primary me-2">New</span>
          )}
          <div>
            <div className="fw-bold">{message.subject}</div>
            <div className="text-muted small">
              From: {message.senderName}
              {message.equipmentName && ` | Equipment: ${message.equipmentName}`}
            </div>
          </div>
        </div>
      </td>
      <td>{new Date(message.createdAt).toLocaleString()}</td>
      <td>
        <div className="btn-group">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setSelectedMessage(message);
              setIsModalOpen(true);
            }}
          >
            View
          </button>
          <button
            className="btn btn-sm btn-success"
            onClick={() => handleReply(message)}
          >
            Reply
          </button>
          {message.status === 'UNREAD' && (
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleMarkAsRead(message.id)}
            >
              Mark as Read
            </button>
          )}
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDeleteMessage(message.id)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

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
    <div className="messages-management">
      <div className="row mb-4">
        <div className="col">
          <h2>Messages</h2>
        </div>
        <div className="col-auto">
          <div className="btn-group">
            <button
              className={`btn btn-outline-primary ${filter === 'UNREAD' ? 'active' : ''}`}
              onClick={() => setFilter('UNREAD')}
            >
              Unread
            </button>
            <button
              className={`btn btn-outline-primary ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All
            </button>
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
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => renderMessageRow(message))}
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
        <div
          className="modal fade show"
          style={{ display: 'block' }}
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Message Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                {renderMessageContent(selectedMessage)}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    handleDeleteMessage(selectedMessage.id);
                    setIsModalOpen(false);
                  }}
                >
                  Delete Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModalOpen && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reply to Message</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setIsReplyModalOpen(false);
                      setReplyContent('');
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="original-message mb-4 p-3 bg-light rounded">
                    <div className="text-muted small mb-2">Original Message:</div>
                    <div className="fw-bold mb-1">{selectedMessage?.subject}</div>
                    <div className="small text-muted mb-2">
                      From: {selectedMessage?.senderName} ({selectedMessage?.senderEmail})
                      <br />
                      Date: {selectedMessage && new Date(selectedMessage.createdAt).toLocaleString()}
                    </div>
                    <div className="original-content">{selectedMessage?.content}</div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="replyContent" className="form-label">Your Reply</label>
                    <textarea
                      id="replyContent"
                      className="form-control"
                      rows={5}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type your reply here..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsReplyModalOpen(false);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSendReply}
                    disabled={!replyContent.trim()}
                  >
                    Send Reply
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
