const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectID: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  coordinatorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Project', projectSchema);