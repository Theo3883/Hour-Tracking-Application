const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Task = require('../models/Task');
const { authenticate } = require('../middleware/auth');
const uri = process.env.MONGODB_URI;

// Get all tasks
router.get('/', authenticate, async (req, res) => {
  console.log('GET /tasks');
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const tasks = await Task.find({}).populate('userID').populate('projectID');
    console.log('Tasks retrieved:', tasks);
    res.json(tasks);
  } catch (err) {
    console.error('Error retrieving tasks:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get tasks by project
router.get('/project/:projectId', authenticate, async (req, res) => {
  console.log('GET /tasks/project/', req.params.projectId);
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const tasks = await Task.find({ projectID: req.params.projectId })
      .populate('userID')
      .populate('projectID');
    console.log('Project tasks retrieved:', tasks);
    res.json(tasks);
  } catch (err) {
    console.error('Error retrieving project tasks:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new task
router.post('/', authenticate, async (req, res) => {
  console.log('POST /tasks', req.body);
  const task = new Task({
    userID: req.body.userID,
    projectID: req.body.projectID,
    name: req.body.name,
    hours_worked: req.body.hours_worked,
    approved: req.body.approved || false
  });

  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const newTask = await task.save();
    console.log('Task created:', newTask);
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update a task
router.patch('/:id', authenticate, async (req, res) => {
  console.log('PATCH /tasks/:id', req.params.id, req.body);
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.body.name != null) {
      task.name = req.body.name;
    }
    if (req.body.hours_worked != null) {
      task.hours_worked = req.body.hours_worked;
    }
    if (req.body.approved != null) {
      task.approved = req.body.approved;
    }

    const updatedTask = await task.save();
    console.log('Task updated:', updatedTask);
    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a task
router.delete('/:id', authenticate, async (req, res) => {
  console.log('DELETE /tasks/:id', req.params.id);
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('Task deleted:', task);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;