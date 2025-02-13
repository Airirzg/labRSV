interface SearchSidebarProps {
  onSearch: (searchTerm: string) => void;
  onCategoryFilter: (category: string) => void;
  onAvailabilityFilter: (available: boolean) => void;
}

const SearchSidebar = ({ onSearch, onCategoryFilter, onAvailabilityFilter }: SearchSidebarProps) => {
  const categories = [
    'All',
    'Laboratory',
    'Medical',
    'Research',
    'Testing'
  ];

  return (
    <div className="search-sidebar p-4 bg-white rounded shadow-sm">
      <h4 className="mb-4">Search & Filter</h4>
      
      {/* Search Input */}
      <div className="mb-4">
        <label htmlFor="search" className="form-label">Search Equipment</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            id="search"
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
          />
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="form-label">Category</label>
        <div className="d-flex flex-column gap-2">
          {categories.map((category) => (
            <div key={category} className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="category"
                id={`category-${category}`}
                onChange={() => onCategoryFilter(category === 'All' ? '' : category)}
              />
              <label className="form-check-label" htmlFor={`category-${category}`}>
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="mb-4">
        <label className="form-label">Availability</label>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="available"
            onChange={(e) => onAvailabilityFilter(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="available">
            Available Now
          </label>
        </div>
      </div>
    </div>
  );
};

export default SearchSidebar;
