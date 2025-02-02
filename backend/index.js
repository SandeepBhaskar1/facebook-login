const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const User = require('./models/User'); 
require('dotenv').config();

const app = express();
const PORT = 1163;
const FRONTEND_URL = process.env.NODE_ENV === 'production' ? 
process.env.FRONTEND_CLOUD_URL : process.env.FRONTEND_LOCAL_URL ;

const corsOption = {
  origin: process.env.NODE_ENV === 'production' ? 
  process.env.FRONTEND_CLOUD_URL : process.env.FRONTEND_LOCAL_URL,
  credentials: true,
}

app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB', err));

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, 
};

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access Denied. No Token Provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or Expired Token' });
    req.user = user;
    next();
  });
};

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

    const token = jwt.sign({ userID: newUser._id, email: newUser.emailId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, cookieOptions);
    res.json({ message: 'User Registered Successfully!', token, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

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

    const token = jwt.sign({ userID: user._id, email: user.emailId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, cookieOptions);
    res.json({ message: 'Login Successful!', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/user-data', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ firstName: user.firstName, surName: user.surName, emailId: user.emailId, dateOfBirth: user.dateOfBirth, gender: user.gender });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.status(200).json({ message: 'Logged out successfully' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
