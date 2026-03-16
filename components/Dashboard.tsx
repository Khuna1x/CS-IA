import React, { useState, useEffect } from 'react';
import { Item, Category, Location, ItemType } from '../types';
import { getItems } from '../services/storageService';
import ItemCard from './ItemCard';
import { Loader, ArrowUpDown } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state from localStorage
  const [filterType, setFilterType] = useState<ItemType | 'ALL'>(() => 
    (localStorage.getItem('hostel_filter_type') as ItemType | 'ALL') || 'ALL'
  );
  const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>(() => 
    (localStorage.getItem('hostel_filter_category') as Category | 'ALL') || 'ALL'
  );
  const [filterLocation, setFilterLocation] = useState<Location | 'ALL'>(() => 
    (localStorage.getItem('hostel_filter_location') as Location | 'ALL') || 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState(() => 
    localStorage.getItem('hostel_filter_search') || ''
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => 
    (localStorage.getItem('hostel_sort_order') as 'asc' | 'desc') || 'desc'
  );

  useEffect(() => {
    setIsLoading(true);
    // Simulate a network delay for better UX (to show loading state)
    const timer = setTimeout(() => {
      setItems(getItems());
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Persist state changes
  useEffect(() => { localStorage.setItem('hostel_filter_type', filterType); }, [filterType]);
  useEffect(() => { localStorage.setItem('hostel_filter_category', filterCategory); }, [filterCategory]);
  useEffect(() => { localStorage.setItem('hostel_filter_location', filterLocation); }, [filterLocation]);
  useEffect(() => { localStorage.setItem('hostel_filter_search', searchQuery); }, [searchQuery]);
  useEffect(() => { localStorage.setItem('hostel_sort_order', sortOrder); }, [sortOrder]);

  const filteredItems = items.filter(item => {
    if (item.status === 'RESOLVED') return false; 
    
    // Filter by Type (Lost/Found)
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    
    // Filter by Category
    if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
    
    // Filter by Location
    if (filterLocation !== 'ALL' && item.location !== filterLocation) return false;
    
    // Text Search (checks Title, Description, Category, and Location)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);
      
      if (!matchesSearch) return false;
    }

    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = new Date(a.dateReported).getTime();
    const dateB = new Date(b.dateReported).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const clearFilters = () => {
    setFilterType('ALL');
    setFilterCategory('ALL');
    setFilterLocation('ALL');
    setSearchQuery('');
    setSortOrder('desc');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Overview of reported items.</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4 justify-between items-start sm:items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 text-sm rounded border ${filterType === 'ALL' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType('LOST')}
              className={`px-4 py-2 text-sm rounded border ${filterType === 'LOST' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              Lost Items
            </button>
            <button 
              onClick={() => setFilterType('FOUND')}
              className={`px-4 py-2 text-sm rounded border ${filterType === 'FOUND' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              Found Items
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
             <ArrowUpDown size={16} />
             <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="bg-transparent border-none font-medium focus:ring-0 cursor-pointer"
             >
               <option value="desc">Newest First</option>
               <option value="asc">Oldest First</option>
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-gray-400 rounded p-2 text-sm w-full"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Category | 'ALL')}
            className="bg-white border border-gray-400 rounded p-2 text-sm w-full"
          >
            <option value="ALL">All Categories</option>
            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value as Location | 'ALL')}
            className="bg-white border border-gray-400 rounded p-2 text-sm w-full"
          >
            <option value="ALL">All Locations</option>
            {Object.values(Location).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button
            onClick={clearFilters}
            className="bg-gray-200 text-gray-800 rounded p-2 text-sm font-medium hover:bg-gray-300 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-blue-600" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.length > 0 ? (
            sortedItems.map(item => <ItemCard key={item.id} item={item} />)
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              No items found matching your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;