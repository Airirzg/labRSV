import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Status } from '@prisma/client';
import { showToast } from '@/utils/notifications';
import { Equipment, Category } from '@/types';
import ReactPaginate from 'react-paginate';
import CategoryModal from './CategoryModal'; // Assuming CategoryModal is in the same directory
import { useAuth } from '@/context/AuthContext';

interface FormData {
  name: string;
  description: string;
  imageUrl?: string;
  imageUrls?: string[]; // Add support for multiple images
  location: string;
  categoryId: string;
  status: Status;
  availability: boolean;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  location: '',
  categoryId: '',
  status: 'AVAILABLE',
  availability: true,
  imageUrls: [], // Initialize empty array for multiple images
};

const EquipmentManagement: React.FC = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem('token');
    return isFormData 
      ? { 'Authorization': `Bearer ${token}` } as Record<string, string>
      : {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as Record<string, string>;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Create a FormData object for each file
    const uploadPromises = acceptedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('/api/admin/equipment/upload-image', {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: formData,
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to upload image');
        }

        return responseData.imageUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        showToast(error instanceof Error ? error.message : 'Failed to upload image', 'error');
        return null;
      }
    });

    // Wait for all uploads to complete
    const uploadedImageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[];
    
    if (uploadedImageUrls.length > 0) {
      // Set the first image as the main imageUrl for backward compatibility
      const mainImageUrl = uploadedImageUrls[0];
      
      // Update the form data with all image URLs
      setFormData((prev) => ({
        ...prev,
        imageUrl: prev.imageUrl || mainImageUrl, // Keep existing main image if there is one
        imageUrls: [...(prev.imageUrls || []), ...uploadedImageUrls]
      }));
      
      // Update the uploaded images state
      setUploadedImages((prev) => [...prev, ...uploadedImageUrls]);
      
      showToast(`${uploadedImageUrls.length} image(s) uploaded successfully`, 'success');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 5, // Allow up to 5 files
    multiple: true // Allow multiple file selection
  });

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((_, index) => index !== indexToRemove)
    }));
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Authentication required', 'error');
      return;
    }

    // Set up SSE connection
    const eventSource = new EventSource(`/api/admin/sse?token=${encodeURIComponent(token)}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'reservationUpdate' && data.reservation.equipment) {
          // Refresh equipment list when a reservation is updated
          fetchEquipment();
        }
      } catch (error) {
        console.error('Error processing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    const handleRefreshEquipment = () => {
      fetchEquipment();
    };

    window.addEventListener('refreshEquipment', handleRefreshEquipment);

    // Initial data fetch
    Promise.all([fetchEquipment(), fetchCategories()]).catch(error => {
      console.error('Error initializing data:', error);
      showToast('Failed to load initial data', 'error');
    });

    // Cleanup
    return () => {
      eventSource.close();
      window.removeEventListener('refreshEquipment', handleRefreshEquipment);
    };
  }, [currentPage, filter, searchTerm, selectedCategory]);

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: (currentPage + 1).toString(),
        limit: '10',
        ...(filter !== 'ALL' && { status: filter }),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
      }).toString();

      console.log('Fetching equipment with params:', queryParams); // Debug log

      const response = await fetch(`/api/admin/equipment${queryParams ? `?${queryParams}` : ''}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch equipment');
      }

      const data = await response.json();
      console.log('Received equipment data:', data); // Debug log

      if (!data.items || !Array.isArray(data.items)) {
        console.error('Invalid equipment data format:', data);
        setEquipment([]);
        setTotalPages(0);
        return;
      }

      setEquipment(data.items);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / 10));
    } catch (error) {
      console.error('Error fetching equipment:', error);
      showToast(error instanceof Error ? error.message : 'Failed to fetch equipment', 'error');
      setEquipment([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Failed to fetch categories', 'error');
      setCategories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.name || !formData.categoryId) {
        showToast('Please fill in all required fields (name and category)', 'error');
        return;
      }

      const payload: any = {
        ...formData,
        imageUrls: formData.imageUrls || [], // Include imageUrls in the payload
      };

      // Ensure imageUrls is always an array, even if it's empty
      if (!Array.isArray(payload.imageUrls)) {
        payload.imageUrls = [];
      }

      // Don't include userId if user is not available
      if (user && user.id) {
        payload.userId = user.id;
      }

      console.log('Submitting equipment data:', payload);

      const url = selectedEquipment
        ? `/api/admin/equipment/${selectedEquipment.id}`
        : '/api/admin/equipment';
      
      const method = selectedEquipment ? 'PUT' : 'POST';
      
      console.log(`Sending ${method} request to ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to save equipment');
      }

      showToast(
        `Equipment ${selectedEquipment ? 'updated' : 'created'} successfully`,
        'success'
      );
      
      // Reset form and refresh equipment list
      setFormData(initialFormData);
      setSelectedEquipment(null);
      setShowAddForm(false);
      setUploadedImages([]); // Reset uploaded images
      fetchEquipment();
    } catch (error) {
      console.error('Error saving equipment:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to save equipment',
        'error'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

    try {
      const response = await fetch(`/api/admin/equipment/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      let errorMessage = 'Failed to delete equipment';
      
      // Try to parse the response as JSON
      try {
        const data = await response.json();
        
        // If successful response
        if (response.ok) {
          showToast(data.message || 'Equipment deleted successfully', 'success');
          // Force a complete refresh of equipment data
          setCurrentPage(0); // Reset to first page
          setSearchTerm(''); // Clear any search terms
          setFilter('ALL'); // Reset filters
          setSelectedCategory(''); // Reset category filter
          await fetchEquipment(); // Fetch fresh data
          return;
        }
        
        // If error response with message
        if (data && data.message) {
          errorMessage = data.message;
          
          // Add extra context for reservation conflicts
          if (data.reservations && data.reservations > 0) {
            errorMessage += `. There ${data.reservations === 1 ? 'is' : 'are'} ${data.reservations} active reservation${data.reservations === 1 ? '' : 's'}.`;
          }
        }
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        // Continue with default error message if JSON parsing fails
      }
      
      throw new Error(errorMessage);
    } catch (error) {
      console.error('Error deleting equipment:', error);
      showToast(error instanceof Error ? error.message : 'Failed to delete equipment', 'error');
    }
  };

  // Debounced search function
  const handleSearchChange = (value: string) => {
    setSearchInputValue(value);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set a new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 500); // 500ms delay
  };

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className="container-fluid p-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              {selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </h5>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowAddForm(false);
                setSelectedEquipment(null);
                setFormData(initialFormData);
              }}
            >
              Back to List
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-control"
                    rows={3}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                    className="form-select"
                    required
                  >
                    {Object.values(Status).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Image</label>
                  <div
                    {...getRootProps()}
                    className={`border border-2 border-dashed rounded p-4 text-center ${
                      isDragActive ? 'border-primary bg-light' : 'border-secondary'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p className="mb-0">Drop the image here ...</p>
                    ) : (
                      <div>
                        <p className="mb-0">Drag and drop an image here, or click to select</p>
                        <small className="text-muted">Supports: JPG, JPEG, PNG, GIF</small>
                      </div>
                    )}
                  </div>
                  {(formData.imageUrl || (formData.imageUrls && formData.imageUrls.length > 0)) && (
                    <div className="mt-2">
                      {formData.imageUrl && (
                        <img
                          src={decodeURIComponent(formData.imageUrl)}
                          alt="Equipment preview"
                          style={{ height: '8rem', objectFit: 'contain' }}
                          className="rounded me-2"
                        />
                      )}
                      {formData.imageUrls?.map((imageUrl, index) => (
                        <div key={index} className="d-inline-block me-2">
                          <img
                            src={decodeURIComponent(imageUrl)}
                            alt="Equipment preview"
                            style={{ height: '8rem', objectFit: 'contain' }}
                            className="rounded"
                          />
                          <button
                            className="btn btn-sm btn-danger mt-1"
                            onClick={() => removeImage(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    {selectedEquipment ? 'Update Equipment' : 'Add Equipment'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as Status | 'ALL')}
                className="form-select"
                style={{ width: 'auto' }}
              >
                <option value="ALL">All Status</option>
                {Object.values(Status).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
                style={{ width: 'auto' }}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Search..."
                value={searchInputValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="form-control"
                style={{ width: 'auto' }}
              />
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                Add New Equipment
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowCategoryModal(true)}
              >
                Manage Categories
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {equipment.length === 0 ? (
            <p className="text-center text-muted py-4">No equipment found</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Location</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.imageUrl && (
                          <img
                            src={decodeURIComponent(item.imageUrl)}
                            alt={item.name}
                            style={{ 
                              height: '3rem', 
                              width: '3rem', 
                              objectFit: 'cover',
                              borderRadius: '8px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"%3E%3Crect width="48" height="48" fill="%23E2E8F0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="8" fill="%236B7280" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        )}
                        {item.imageUrls && item.imageUrls.length > 0 && (
                          <div className="image-count mt-1">
                            <span className="badge bg-primary rounded-pill">+{item.imageUrls.length}</span>
                          </div>
                        )}
                      </td>
                      <td><span className="fw-medium">{item.name}</span></td>
                      <td>
                        {item.description || <span className="text-muted fst-italic">No description</span>}
                      </td>
                      <td>
                        <span>{item.location || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {item.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge bg-${
                            item.status === 'AVAILABLE'
                              ? 'success'
                              : item.status === 'IN_USE'
                              ? 'warning'
                              : 'danger'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            onClick={() => {
                              setSelectedEquipment(item);
                              setFormData({
                                name: item.name,
                                description: item.description || '',
                                imageUrl: item.imageUrl || undefined,
                                imageUrls: item.imageUrls || [],
                                location: item.location || '',
                                categoryId: item.categoryId,
                                status: item.status,
                                availability: item.availability,
                              });
                              setUploadedImages(item.imageUrls || []);
                              setShowAddForm(true);
                            }}
                            className="btn btn-sm btn-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
      {showCategoryModal && (
        <CategoryModal
          show={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onCategoryChange={fetchCategories}
        />
      )}
    </div>
  );
};

export default EquipmentManagement;
