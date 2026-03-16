import React from 'react';
import { Item } from '../types';
import { Link } from 'react-router-dom';

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const isLost = item.type === 'LOST';
  
  return (
    <Link to={`/item/${item.id}`} className="block">
      <div className="bg-white border border-gray-300 rounded overflow-hidden hover:border-blue-500 transition-colors h-full flex flex-col">
        {item.imageBase64 && (
          <div className="h-32 w-full bg-gray-200">
             <img src={item.imageBase64} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="p-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <span className={`text-xs font-bold px-2 py-1 rounded text-white ${isLost ? 'bg-red-500' : 'bg-green-500'}`}>
              {item.type}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(item.dateReported).toLocaleDateString()}
            </span>
          </div>
          
          <h3 className="font-bold text-lg text-gray-800 truncate">
            {item.title}
          </h3>
          
          <div className="mt-2 text-sm text-gray-600 space-y-1">
             <p><span className="font-semibold">Category:</span> {item.category}</p>
             <p><span className="font-semibold">Location:</span> {item.location}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;