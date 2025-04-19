import React, { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface SearchSidebarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  showAvailableOnly: boolean;
  setShowAvailableOnly: (available: boolean) => void;
}

const SearchSidebar = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  showAvailableOnly,
  setShowAvailableOnly
}: SearchSidebarProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({ categories: true, availability: true });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: 'categories' | 'availability') => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section]
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowAvailableOnly(false);
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== '' || showAvailableOnly;

  return (
    <div className="search-sidebar p-4 bg-white rounded shadow-sm" style={{ borderRadius: '12px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 fw-bold">Filters</h4>
        {hasActiveFilters && (
          <button 
            className="btn btn-sm btn-link text-decoration-none p-0" 
            onClick={clearFilters}
            style={{ fontSize: '0.9rem' }}
          >
            <i className="bi bi-x-circle me-1"></i>
            Clear all
          </button>
        )}
      </div>
      
      {/* Search Input */}
      <div className="mb-4">
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control bg-light border-start-0"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              borderRadius: '0 8px 8px 0',
              fontSize: '0.95rem',
              padding: '0.6rem 1rem'
            }}
          />
        </div>
        {searchTerm && (
          <div className="mt-2 d-flex align-items-center">
            <span className="badge bg-primary rounded-pill px-3 py-2 d-flex align-items-center">
              "{searchTerm}"
              <button 
                className="btn btn-sm text-white p-0 ms-2" 
                onClick={() => setSearchTerm('')}
                style={{ fontSize: '0.8rem' }}
              >
                <i className="bi bi-x"></i>
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="filter-section mb-4">
        <div 
          className="d-flex justify-content-between align-items-center mb-3 cursor-pointer"
          onClick={() => toggleSection('categories')}
          style={{ cursor: 'pointer' }}
        >
          <h5 className="mb-0 fw-semibold">Category</h5>
          <i className={`bi bi-chevron-${expanded.categories ? 'up' : 'down'}`}></i>
        </div>
        
        {expanded.categories && (
          <div className="ps-1">
            <div className="category-option mb-2">
              <div 
                className={`category-item d-flex align-items-center p-2 rounded ${selectedCategory === '' ? 'bg-light' : ''}`}
                onClick={() => setSelectedCategory('')}
                style={{ cursor: 'pointer', transition: 'background-color 0.2s ease' }}
              >
                <div className={`form-check-input me-2 ${selectedCategory === '' ? 'checked' : ''}`} style={{ 
                  cursor: 'pointer',
                  marginTop: '0'
                }}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="category"
                    id="category-all"
                    checked={selectedCategory === ''}
                    onChange={() => setSelectedCategory('')}
                    style={{ marginTop: '0' }}
                  />
                </div>
                <label className="form-check-label w-100" htmlFor="category-all" style={{ cursor: 'pointer' }}>
                  All Categories
                </label>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="text-muted small">Loading categories...</span>
              </div>
            ) : (
              <div className="category-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {categories.map((category) => (
                  <div key={category.id} className="category-option mb-2">
                    <div 
                      className={`category-item d-flex align-items-center p-2 rounded ${selectedCategory === category.id ? 'bg-light' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                      style={{ cursor: 'pointer', transition: 'background-color 0.2s ease' }}
                    >
                      <div className="form-check-input me-2" style={{ 
                        cursor: 'pointer',
                        marginTop: '0'
                      }}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="category"
                          id={`category-${category.id}`}
                          checked={selectedCategory === category.id}
                          onChange={() => setSelectedCategory(category.id)}
                          style={{ marginTop: '0' }}
                        />
                      </div>
                      <label className="form-check-label w-100" htmlFor={`category-${category.id}`} style={{ cursor: 'pointer' }}>
                        {category.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div className="filter-section mb-3">
        <div 
          className="d-flex justify-content-between align-items-center mb-3 cursor-pointer"
          onClick={() => toggleSection('availability')}
          style={{ cursor: 'pointer' }}
        >
          <h5 className="mb-0 fw-semibold">Availability</h5>
          <i className={`bi bi-chevron-${expanded.availability ? 'up' : 'down'}`}></i>
        </div>
        
        {expanded.availability && (
          <div className="ps-1">
            <div 
              className={`d-flex align-items-center p-2 rounded ${showAvailableOnly ? 'bg-light' : ''}`}
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              style={{ cursor: 'pointer', transition: 'background-color 0.2s ease' }}
            >
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="available"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label className="form-check-label ms-2" htmlFor="available" style={{ cursor: 'pointer' }}>
                  Available Now
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">Active filters:</span>
            <span className="badge bg-primary rounded-pill">{
              (searchTerm ? 1 : 0) + 
              (selectedCategory ? 1 : 0) + 
              (showAvailableOnly ? 1 : 0)
            }</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSidebar;
