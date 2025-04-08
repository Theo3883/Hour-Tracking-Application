const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  hours_worked: {
    type: Number,
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Task', taskSchema);