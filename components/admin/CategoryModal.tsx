import { useState, useEffect } from 'react';
import { showToast } from '@/utils/notifications';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryModalProps {
  show: boolean;
  onClose: () => void;
  onCategoryChange: () => void;
}

export default function CategoryModal({ show, onClose, onCategoryChange }: CategoryModalProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    if (show) {
      fetchCategories();
    }
  }, [show]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [show, onClose]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast(error instanceof Error ? error.message : 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save category');
      }

      showToast(`Category ${editingCategory ? 'updated' : 'created'} successfully`, 'success');
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
      onCategoryChange();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast(error instanceof Error ? error.message : 'Failed to save category', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      showToast('Category deleted successfully', 'success');
      fetchCategories();
      onCategoryChange();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast(error instanceof Error ? error.message : 'Failed to delete category', 'error');
    }
  };

  if (!show) return null;

  return (
    <>
      <div 
        className={`modal fade ${show ? 'show' : ''}`} 
        style={{ display: show ? 'block' : 'none' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Manage Categories</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-7">
                  {loading ? (
                    <div className="text-center">Loading categories...</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category) => (
                            <tr key={category.id}>
                              <td>{category.name}</td>
                              <td>{category.description || '-'}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => {
                                    setEditingCategory(category);
                                    setFormData({
                                      name: category.name,
                                      description: category.description || '',
                                    });
                                  }}
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(category.id)}
                                >
                                  <FiTrash2 />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="col-md-5">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="card-title mb-0">
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                      </h6>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label htmlFor="name" className="form-label">
                            Name*
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="description" className="form-label">
                            Description
                          </label>
                          <textarea
                            className="form-control"
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary">
                            {editingCategory ? 'Update' : 'Add'} Category
                          </button>
                          {editingCategory && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                setEditingCategory(null);
                                setFormData({ name: '', description: '' });
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div 
        className={`modal-backdrop fade ${show ? 'show' : ''}`} 
        style={{ display: show ? 'block' : 'none' }}
      ></div>
    </>
  );
}
