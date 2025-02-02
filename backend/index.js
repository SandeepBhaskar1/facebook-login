// index.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 1163;

// Updated CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://facebook-login-frontend.vercel.app'
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

// Apply CORS with options
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Updated cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  domain: process.env.NODE_ENV === 'production' 
    ? '.vercel.app'
    : 'localhost'
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No Token Provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or Expired Token' });
    }
    req.user = user;
    next();
  });
};

// Register endpoint
app.post('/register', async (req, res) => {
  const { firstName, surName, dateOfBirth, gender, emailId, password } = req.body;

  if (!firstName || !surName || !dateOfBirth || !gender || !emailId || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      surName,
      dateOfBirth,
      gender,
      emailId,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { userID: newUser._id, email: newUser.emailId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.cookie('token', token, cookieOptions);
    res.json({ 
      message: 'User Registered Successfully!', 
      token, 
      user: {
        firstName: newUser.firstName,
        surName: newUser.surName,
        emailId: newUser.emailId,
        dateOfBirth: newUser.dateOfBirth,
        gender: newUser.gender
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { emailId, password } = req.body;

  try {
    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userID: user._id, email: user.emailId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.cookie('token', token, cookieOptions);
    res.json({ 
      message: 'Login Successful!', 
      token, 
      user: {
        firstName: user.firstName,
        surName: user.surName,
        emailId: user.emailId,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get user data endpoint
app.get('/user-data', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      firstName: user.firstName,
      surName: user.surName,
      emailId: user.emailId,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender
    });
  } catch (err) {
    console.error('User data error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    ...cookieOptions,
    maxAge: 0
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});