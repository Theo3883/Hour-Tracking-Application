const mongoose = require('mongoose');

const orgTeamSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }
});

module.exports = mongoose.model('OrgTeam', orgTeamSchema);