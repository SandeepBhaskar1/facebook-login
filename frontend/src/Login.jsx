import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ emailId: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.MODE === 'production' ? 
  import.meta.env.VITE_BACKEND_CLOUD_URL : import.meta.env.VITE_BACKEND_LOCAL_URL;

  const handleNewUserClick = () => {
    navigate('/register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.emailId || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/login`, formData, { withCredentials: true });
      localStorage.setItem('jwtToken', response.data.token); 
      navigate('/'); 
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10">
      <div className="text-blue-600 text-6xl font-bold mb-8">facebook</div>
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Log into your account</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-md"
            value={formData.emailId}
            onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
            autoComplete='current-username'
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-md"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            autoComplete='current-password'
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 mb-8 rounded-md font-bold hover:bg-green-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>

          <div className="text-center pt-5 border-t-1">
            <button
              onClick={handleNewUserClick}
              className="text-blue-600 hover:underline text-center"
            >
              Create New Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
