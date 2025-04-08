const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Keep existing fields for backward compatibility
  userID: {
    type: String,
    unique: true,
    sparse: true // Allow null values since we'll use Google IDs for new users
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  // Make password optional for Google auth users
  password: {
    type: String,
    required: false
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  departmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Add OAuth specific fields
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  image: {
    type: String
  }
});

module.exports = mongoose.model('User', userSchema);