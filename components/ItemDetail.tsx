import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Item } from '../types';
import { getItems, updateItemStatus, deleteItem } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { Loader, ShieldCheck, Trash2, CheckCircle } from 'lucide-react';

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [potentialMatches, setPotentialMatches] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Derive Warden status directly from the user object
  const isWarden = user?.role === 'WARDEN';

  useEffect(() => {
    setIsLoading(true);
    // Simulate network delay
    const timer = setTimeout(() => {
      const items = getItems();
      const found = items.find(i => i.id === id);
      if (found) {
        setItem(found);
        
        // Simple Logic: Find items of opposite type with same Category
        const matches = items.filter(candidate => 
          candidate.status === 'OPEN' && 
          candidate.id !== found.id &&
          candidate.type !== found.type && // Must be opposite (Lost vs Found)
          candidate.category === found.category // Must match category
        );
        setPotentialMatches(matches);
      }
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  const handleResolve = () => {
    if (!id) return;
    
    // Warden: Immediate action without confirmation (Admin Override)
    if (isWarden) {
      setIsProcessing(true);
      try {
        updateItemStatus(id, 'RESOLVED');
        navigate('/');
      } catch (error) {
        console.error("Error resolving item:", error);
        setIsProcessing(false);
      }
    } else {
      // Student/Owner: Standard confirmation required
      if (window.confirm("Mark this item as resolved/returned?")) {
        setIsProcessing(true);
        try {
          updateItemStatus(id, 'RESOLVED');
          navigate('/');
        } catch (error) {
          console.error("Error resolving item:", error);
          setIsProcessing(false);
        }
      }
    }
  };

  const handleDelete = () => {
    if (!id) return;

    if (isWarden) {
      // Force delete logic for Warden - No confirmation
      setIsProcessing(true);
      try {
        deleteItem(id);
        navigate('/');
      } catch (error) {
        console.error("Error deleting item:", error);
        setIsProcessing(false);
      }
    } else {
      if (window.confirm("Permanently delete this report? This cannot be undone.")) {
        setIsProcessing(true);
        try {
          deleteItem(id);
          navigate('/');
        } catch (error) {
          console.error("Error deleting item:", error);
          setIsProcessing(false);
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!item) return <div className="p-4">Item not found</div>;

  // Allow edit if user owns the item OR user is a warden.
  // For legacy items (no userId), we technically allow anyone to edit in this demo,
  // but logically it should be restricted. For now, we keep existing logic to ensure seed data is interactable.
  const isOwner = item.userId && user && user.id === item.userId;
  const isLegacyOpen = !item.userId; // Seed items
  const canEdit = isWarden || isOwner || isLegacyOpen;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">
        &larr; Back to Dashboard
      </button>

      <div className={`bg-white border rounded p-6 ${isWarden ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-gray-300'}`}>
        {isWarden && (
          <div className="bg-blue-100 text-blue-900 text-xs font-bold px-2 py-1 mb-4 inline-flex items-center gap-1 rounded border border-blue-200">
            <ShieldCheck size={14} />
            WARDEN ADMIN CONTROL
          </div>
        )}
        
        <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
          <div>
            <span className={`inline-block px-2 py-1 rounded text-xs text-white font-bold mb-2 ${item.type === 'LOST' ? 'bg-red-500' : 'bg-green-500'}`}>
              {item.type}
            </span>
            <h1 className="text-2xl font-bold text-gray-800">{item.title}</h1>
            <p className="text-sm text-gray-500">Reported on: {new Date(item.dateReported).toLocaleString()}</p>
            {item.status === 'RESOLVED' && (
              <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-bold border border-gray-300">
                <CheckCircle size={12} /> RESOLVED
              </span>
            )}
          </div>
          
          {canEdit && (
             <div className="flex flex-col sm:flex-row gap-2">
                {item.status === 'OPEN' && (
                  <button 
                    type="button"
                    onClick={handleResolve} 
                    disabled={isProcessing}
                    className="px-3 py-1 bg-green-100 text-green-800 border border-green-300 rounded text-sm hover:bg-green-200 flex items-center gap-2 justify-center font-medium"
                  >
                    {isProcessing ? <Loader size={14} className="animate-spin"/> : <ShieldCheck size={14} />}
                    {isWarden ? 'Admin Resolve' : 'Mark Resolved'}
                  </button>
                )}
                 <button 
                   type="button"
                   onClick={handleDelete} 
                   disabled={isProcessing}
                   className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded text-sm hover:bg-red-200 flex items-center gap-2 justify-center font-medium"
                 >
                     {isProcessing ? <Loader size={14} className="animate-spin"/> : <Trash2 size={14} />}
                     {isWarden ? 'Force Delete' : 'Delete'}
                 </button>
            </div>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 mb-4 whitespace-pre-wrap">{item.description}</p>

            <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2 text-sm">
              <p><span className="font-bold">Category:</span> {item.category}</p>
              <p><span className="font-bold">Location:</span> {item.location}</p>
              <p><span className="font-bold">Contact Name:</span> {item.contactName || 'N/A'}</p>
              <p><span className="font-bold">Contact Info:</span> {item.contactInfo}</p>
              {isWarden && item.userId && (
                <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                  User ID: {item.userId}
                </p>
              )}
            </div>
          </div>

          <div>
            {item.imageBase64 ? (
              <div className="border border-gray-300 rounded p-1">
                <img src={item.imageBase64} alt={item.title} className="w-full h-auto" />
              </div>
            ) : (
              <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-300 rounded">
                No Image Available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simple Matching Section */}
      {item.status === 'OPEN' && potentialMatches.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-2">Potential Matches</h2>
          <p className="text-sm text-blue-800 mb-4">
            The system found the following items that match the category <strong>{item.category}</strong>.
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {potentialMatches.map(match => (
              <div key={match.id} className="bg-white border border-gray-300 p-3 rounded flex justify-between items-center">
                <div>
                   <div className="font-bold text-sm text-gray-800">{match.title}</div>
                   <div className="text-xs text-gray-500">
                     Location: {match.location} | Reported: {new Date(match.dateReported).toLocaleDateString()}
                   </div>
                </div>
                <button 
                  onClick={() => navigate(`/item/${match.id}`)}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                >
                  View Report
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;