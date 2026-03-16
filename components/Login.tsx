import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader, Shield, User } from 'lucide-react';

const Login: React.FC = () => {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWardenLogin, setIsWardenLogin] = useState(false);
  
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const loggedInUser = await login(admissionNumber, password, rememberMe);
    
    if (loggedInUser) {
      // Role Check Logic
      if (isWardenLogin && loggedInUser.role !== 'WARDEN') {
        logout(); // Immediately invalidate session
        setError('Access Denied. You are not authorized as a Warden.');
      } else if (!isWardenLogin && loggedInUser.role === 'WARDEN') {
        logout(); // Immediately invalidate session
        setError('Warden accounts must log in via the Warden Portal.');
      } else {
        // Success
        navigate('/');
      }
    } else {
      setError(isWardenLogin ? 'Invalid Admin ID or Password.' : 'Invalid admission number or password.');
    }
    setIsSubmitting(false);
  };

  const toggleLoginMode = () => {
    setIsWardenLogin(!isWardenLogin);
    setAdmissionNumber('');
    setPassword('');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 border border-gray-300 rounded shadow-sm">
      <div className="flex justify-center mb-4">
        {isWardenLogin ? (
          <Shield className="text-blue-800" size={40} />
        ) : (
          <User className="text-blue-600" size={40} />
        )}
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2">
        {isWardenLogin ? 'Warden Portal' : 'Student Login'}
      </h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        {isWardenLogin ? 'Administrative Access Only' : 'Welcome back to HostelFinder'}
      </p>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">
            {isWardenLogin ? 'Admin ID' : 'Admission Number'}
          </label>
          <input
            type="text"
            required
            className="w-full bg-white border border-gray-400 p-2 rounded focus:outline-none focus:border-blue-600"
            value={admissionNumber}
            onChange={(e) => setAdmissionNumber(e.target.value)}
            placeholder={isWardenLogin ? 'Enter admin ID' : 'Enter admission number'}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full bg-white border border-gray-400 p-2 rounded focus:outline-none focus:border-blue-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="mr-2"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember-me" className="text-sm">Remember me</label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white py-2 rounded flex justify-center items-center gap-2 disabled:bg-gray-400 ${
            isWardenLogin ? 'bg-blue-800 hover:bg-blue-900' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin" size={20} />
              {isWardenLogin ? 'Verifying...' : 'Signing In...'}
            </>
          ) : (
            isWardenLogin ? 'Admin Login' : 'Sign In'
          )}
        </button>
      </form>
      
      <div className="mt-6 border-t border-gray-200 pt-4">
        <button 
          onClick={toggleLoginMode}
          className="text-sm text-gray-600 hover:text-blue-800 underline w-full text-center mb-4"
        >
          {isWardenLogin ? 'Switch to Student Login' : 'Log in as Warden'}
        </button>

        {!isWardenLogin && (
          <p className="text-center text-sm">
            No account? <Link to="/signup" className="text-blue-600 underline font-medium">Create Student Account</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;