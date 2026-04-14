import { useState } from 'react';
import { FiSearch, FiChevronDown, FiX } from 'react-icons/fi';

const ApplicationFilterPanel = ({ onFiltersChange, branches = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    minCGPA: '',
    min10thPercentage: '',
    min12thPercentage: '',
    minGraduationPercentage: '',
    hasResume: 'all', // all, true, false
    branch: '',
    skills: '',
    sortBy: 'recently-applied',
  });

  const [activeFilters, setActiveFilters] = useState({});

  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...filters, [field]: value };
    setFilters(updatedFilters);
  };

  const applyFilters = () => {
    // Build active filters object
    const active = {};
    
    if (filters.search) active.search = filters.search;
    if (filters.minCGPA) active.minCGPA = `CGPA ≥ ${filters.minCGPA}`;
    if (filters.min10thPercentage) active.min10thPercentage = `10th ≥ ${filters.min10thPercentage}%`;
    if (filters.min12thPercentage) active.min12thPercentage = `12th ≥ ${filters.min12thPercentage}%`;
    if (filters.minGraduationPercentage) active.minGraduationPercentage = `Grad ≥ ${filters.minGraduationPercentage}%`;
    if (filters.hasResume !== 'all') active.hasResume = filters.hasResume === 'true' ? 'Has Resume' : 'No Resume';
    if (filters.branch) active.branch = filters.branch;
    if (filters.skills) active.skills = filters.skills;
    if (filters.sortBy) active.sortBy = filters.sortBy;
    
    setActiveFilters(active);
    onFiltersChange(filters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      search: '',
      minCGPA: '',
      min10thPercentage: '',
      min12thPercentage: '',
      minGraduationPercentage: '',
      hasResume: 'all',
      branch: '',
      skills: '',
      sortBy: 'recently-applied',
    };
    setFilters(emptyFilters);
    setActiveFilters({});
    onFiltersChange(emptyFilters);
  };

  const removeActiveFilter = (filterKey) => {
    const updatedFilters = { ...filters };
    
    switch (filterKey) {
      case 'minCGPA':
      case 'min10thPercentage':
      case 'min12thPercentage':
      case 'minGraduationPercentage':
        updatedFilters[filterKey] = '';
        break;
      case 'hasResume':
        updatedFilters.hasResume = 'all';
        break;
      case 'search':
      case 'branch':
      case 'skills':
        updatedFilters[filterKey] = '';
        break;
      default:
        break;
    }
    
    setFilters(updatedFilters);
    
    const newActiveFilters = { ...activeFilters };
    delete newActiveFilters[filterKey];
    setActiveFilters(newActiveFilters);
    
    onFiltersChange(updatedFilters);
  };

  return (
    <div className="mb-6 bg-base-100 rounded-lg border border-base-300">
      {/* Filter Header */}
      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-base-200 transition"
           onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <FiSearch size={20} className="text-primary" />
          <span className="font-semibold">Filters & Search</span>
          {Object.keys(activeFilters).length > 0 && (
            <span className="badge badge-primary">{Object.keys(activeFilters).length}</span>
          )}
        </div>
        <FiChevronDown size={20} className={`transition ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {/* Active Filters Display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="px-4 py-2 bg-base-200 flex flex-wrap gap-2 border-t border-base-300">
          {Object.entries(activeFilters).map(([key, label]) => (
            <div key={key} className="badge badge-sm badge-outline gap-2 cursor-pointer hover:badge-primary"
                 onClick={() => removeActiveFilter(key)}>
              {label}
              <FiX size={14} />
            </div>
          ))}
        </div>
      )}

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 border-t border-base-300 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Name, Email, or Skills"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input input-bordered w-full input-sm"
            />
          </div>

          {/* Academic Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Min CGPA</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="0.0 - 10.0"
                value={filters.minCGPA}
                onChange={(e) => handleFilterChange('minCGPA', e.target.value)}
                className="input input-bordered w-full input-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Min 10th Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0-100"
                value={filters.min10thPercentage}
                onChange={(e) => handleFilterChange('min10thPercentage', e.target.value)}
                className="input input-bordered w-full input-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Min 12th Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0-100"
                value={filters.min12thPercentage}
                onChange={(e) => handleFilterChange('min12thPercentage', e.target.value)}
                className="input input-bordered w-full input-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Min Graduation Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0-100"
                value={filters.minGraduationPercentage}
                onChange={(e) => handleFilterChange('minGraduationPercentage', e.target.value)}
                className="input input-bordered w-full input-sm"
              />
            </div>
          </div>

          {/* Resume Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Resume Status</label>
            <select
              value={filters.hasResume}
              onChange={(e) => handleFilterChange('hasResume', e.target.value)}
              className="select select-bordered w-full select-sm"
            >
              <option value="all">All</option>
              <option value="true">Has Resume</option>
              <option value="false">No Resume</option>
            </select>
          </div>

          {/* Branch Filter */}
          {branches.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Branch/Course</label>
              <select
                value={filters.branch}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                className="select select-bordered w-full select-sm"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Skills Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <input
              type="text"
              placeholder="e.g., React, Python, Java"
              value={filters.skills}
              onChange={(e) => handleFilterChange('skills', e.target.value)}
              className="input input-bordered w-full input-sm"
            />
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="select select-bordered w-full select-sm"
            >
              <option value="recently-applied">Recently Applied</option>
              <option value="highest-cgpa">Highest CGPA</option>
              <option value="highest-graduation">Highest Graduation %</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={applyFilters}
              className="btn btn-primary btn-sm flex-1"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="btn btn-outline btn-sm flex-1"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationFilterPanel;
