import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  return (
    <header className="bg-blue-800 text-white shadow-sm relative z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">
          Hostel Lost & Found
        </Link>
        
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:underline">Browse Items</Link>
          <Link to="/report" className="hover:underline">Report Item</Link>

          <div className="h-4 w-px bg-blue-600 mx-2"></div>

          {user ? (
             <div className="relative">
               <button 
                 onClick={() => setIsProfileOpen(!isProfileOpen)}
                 className="flex items-center gap-2 hover:bg-blue-700 px-3 py-2 rounded focus:outline-none"
               >
                 <div className="bg-blue-600 p-1 rounded-full">
                   <User size={16} />
                 </div>
                 <span>{user.name}</span>
               </button>

               {isProfileOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg border border-gray-200 py-1">
                   <div className="px-4 py-2 border-b border-gray-100">
                     <p className="text-xs text-gray-500">Signed in as</p>
                     <p className="font-bold truncate">{user.name}</p>
                   </div>
                   <button 
                     onClick={handleLogout}
                     className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                   >
                     <LogOut size={14} />
                     Logout
                   </button>
                 </div>
               )}
               {/* Click outside overlay */}
               {isProfileOpen && (
                 <div 
                   className="fixed inset-0 z-[-1]" 
                   onClick={() => setIsProfileOpen(false)}
                 ></div>
               )}
             </div>
          ) : (
            <Link 
              to="/login"
              className="bg-white text-blue-800 px-3 py-1 rounded font-medium hover:bg-gray-100"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;