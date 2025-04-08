const mongoose = require('mongoose');

const taskDepartmentSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  departmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
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

module.exports = mongoose.model('TaskDepartment', taskDepartmentSchema);