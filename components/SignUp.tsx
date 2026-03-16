import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { Loader } from 'lucide-react';

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsSubmitting(false);
      return;
    }

    const newUser = {
      id: uuidv4(),
      name,
      admissionNumber,
      gender,
      email,
      password,
      roomNumber,
      role: 'STUDENT' as const
    };

    const success = await signup(newUser);
    if (success) {
      navigate('/');
    } else {
      setError('Admission Number already registered.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 border border-gray-300 rounded shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">Full Name</label>
          <input
            type="text"
            required
            className="w-full bg-white border border-gray-400 p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Admission Number</label>
          <input
            type="text"
            required
            className="w-full bg-white border border-gray-400 p-2 rounded"
            value={admissionNumber}
            onChange={(e) => setAdmissionNumber(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Gender</label>
          <select
            className="w-full bg-white border border-gray-400 p-2 rounded"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full bg-white border border-gray-400 p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Room Number</label>
          <input
            type="text"
            required
            className="w-full bg-white border border-gray-400 p-2 rounded"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full bg-white border border-gray-400 p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 disabled:bg-gray-400 flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin" size={20} />
              Creating...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>
      
      <p className="mt-4 text-center text-sm">
        Have an account? <Link to="/login" className="text-blue-600 underline">Login</Link>
      </p>
    </div>
  );
};

export default SignUp;