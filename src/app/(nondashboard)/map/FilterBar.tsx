"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  ArrowLeft,
} from "lucide-react";

interface FilterBarProps {
  onLocationSearch: (query: string) => void;
  onFilterChange: (filters: MapFilters) => void;
  className?: string;
}

export interface MapFilters {
  issueType: string;
  status: string;
  priority: string;
  dateRange: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onLocationSearch,
  onFilterChange,
  className = "",
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MapFilters>({
    issueType: "all",
    status: "all",
    priority: "all",
    dateRange: "all",
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onLocationSearch(searchQuery.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const updateFilter = (key: keyof MapFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      issueType: "all",
      status: "all",
      priority: "all",
      dateRange: "all",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "all"
  );

  const handleBackClick = () => {
    router.push("/");
  };

  return (
    <div
      className={`bg-white backdrop-blur-sm border-b border-gray-200 shadow-xl ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-around gap-4">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          {/* Location Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search location (e.g., Sambhajinagar, Station Road)"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A64F5] focus:border-transparent outline-none text-sm"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2A64F5] text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-[#2A64F5] text-white border-[#2A64F5]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Issue Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type
                </label>
                <select
                  value={filters.issueType}
                  onChange={(e) => updateFilter("issueType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A64F5] focus:border-transparent outline-none text-sm"
                >
                  <option value="all">All Issues</option>
                  <option value="pothole">Potholes</option>
                  <option value="streetlight">Street Lights</option>
                  <option value="garbage">Garbage</option>
                  <option value="water">Water Issues</option>
                  <option value="road">Road Damage</option>
                  <option value="drainage">Drainage</option>
                  <option value="traffic">Traffic Signals</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A64F5] focus:border-transparent outline-none text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="reported">Reported</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => updateFilter("priority", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A64F5] focus:border-transparent outline-none text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => updateFilter("dateRange", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A64F5] focus:border-transparent outline-none text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.issueType !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  <MapPin className="h-3 w-3" />
                  {filters.issueType}
                </span>
              )}
              {filters.status !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  {filters.status}
                </span>
              )}
              {filters.priority !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  <AlertCircle className="h-3 w-3" />
                  {filters.priority}
                </span>
              )}
              {filters.dateRange !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  <Clock className="h-3 w-3" />
                  {filters.dateRange}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
