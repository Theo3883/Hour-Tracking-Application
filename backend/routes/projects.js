const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const uri = process.env.MONGODB_URI;

// Get all projects
router.get('/', authenticate, async (req, res) => {
  console.log('GET /projects');
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const projects = await Project.find({}).populate('coordinatorID');
    console.log('Projects retrieved:', projects);
    res.json(projects);
  } catch (err) {
    console.error('Error retrieving projects:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new project
router.post('/', authenticate, async (req, res) => {
  console.log('POST /projects', req.body);
  const project = new Project({
    projectID: req.body.projectID,
    name: req.body.name,
    coordinatorID: req.body.coordinatorID
  });

  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const newProject = await project.save();
    console.log('Project created:', newProject);
    res.status(201).json(newProject);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update coordinator
router.post('/updateCoordinator', authenticate, async (req, res) => {
  const { email, projectID } = req.body;

  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = await Project.findById(projectID);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.coordinatorID = user._id;
    await project.save();

    res.status(200).json({ message: 'Coordinator updated successfully' });
  } catch (err) {
    console.error('Error updating coordinator:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;