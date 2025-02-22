const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  surName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  gender: { type: String, required: true },
  emailId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
