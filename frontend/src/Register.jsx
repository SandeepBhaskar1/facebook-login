import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    emailOrPhone: '',
    password: '',
    day: '31',
    month: 'Jan',
    year: '2025',
    gender: '',
  });

  const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_CLOUD_URL;
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = Array.from({ length: 100 }, (_, i) => 2025 - i);

  const phoneRegex = /^[0-9]{10}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, surname, emailOrPhone, password, day, month, year, gender } = formData;
    const dateOfBirth = `${day}-${month}-${year}`;

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!emailOrPhone.match(phoneRegex) && !emailOrPhone.match(emailRegex)) {
      setError('Please enter a valid email or phone number');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/register`, {
        firstName,
        surName: surname,
        dateOfBirth,
        gender,
        emailId: emailOrPhone,
        password,
      });

      setSuccessMessage('User Registered Successfully! Redirecting to login...');
      setError('');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred while registering. Please try again later.');
      }
      console.error('Error registering user:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10">
      <div className="text-blue-600 text-6xl font-bold mb-8">facebook</div>

      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Create a new account</h1>
        <p className="text-gray-600 mb-4">It's quick and easy.</p>

        {successMessage && (
          <div className="bg-green-100 text-green-700 p-2 rounded-md mb-4">
            {successMessage}
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name"
              className="p-3 border rounded-md"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Surname"
              className="p-3 border rounded-md"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-gray-600 text-sm">Date of birth</label>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="p-2 border rounded-md bg-white"
              >
                {days.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>

              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="p-2 border rounded-md bg-white"
              >
                {months.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>

              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="p-2 border rounded-md bg-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-gray-600 text-sm">Gender</label>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center justify-between p-2 border rounded-md">
                <span>Female</span>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                />
              </label>
              <label className="flex items-center justify-between p-2 border rounded-md">
                <span>Male</span>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                />
              </label>
              <label className="flex items-center justify-between p-2 border rounded-md">
                <span>Custom</span>
                <input
                  type="radio"
                  name="gender"
                  value="custom"
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                />
              </label>
            </div>
          </div>

          <input
            type="text"
            placeholder="Mobile number or email address"
            className="w-full p-3 border rounded-md"
            value={formData.emailOrPhone}
            onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
            autoComplete="username"
          />

          <input
            type="password"
            placeholder="New password"
            className="w-full p-3 border rounded-md"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            autoComplete="new-password"
          />

          <p className="text-xs text-gray-600">
            By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy.
          </p>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md font-bold hover:bg-green-600"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="/login" className="text-blue-600 hover:underline">Already have an account?</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
