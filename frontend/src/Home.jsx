import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.MODE === 'production' ?
  import.meta.env.VITE_BACKEND_CLOUD_URL : import.meta.env.VITE_BACKEND_LOCAL_URL;


  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login'); 
      return;
    }

    axios.get(`${BACKEND_URL}/user-data`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setUserData(response.data);
      })
      .catch(() => {
        setError('Failed to fetch user data');
      });
  }, [navigate]);

  const handleLogout = () => {
    // Clear JWT token from localStorage
    localStorage.removeItem('jwtToken');

    axios.post(`${BACKEND_URL}/logout`, {}, { withCredentials: true })
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        setError('Failed to log out');
      });
  };

  if (error) return <div>{error}</div>;
  if (!userData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10">
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
      >
        Logout
      </button>

      <div className="text-blue-600 text-6xl font-bold mb-8">Welcome, {userData.firstName}</div>
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Your Personal Data</h1>
        <p className="text-gray-600 mb-4">This is your personal information.</p>

        <div className="space-y-2">
          <p><strong>Name:</strong> {userData.firstName} {userData.surName}</p>
          <p><strong>Email:</strong> {userData.emailId}</p>
          <p><strong>Gender:</strong> {userData.gender}</p>
          <p><strong>Date of Birth:</strong> {userData.dateOfBirth}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
