const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const TaskDepartment = require('../models/TaskDepartment');
const { authenticate } = require('../middleware/auth');
const uri = process.env.MONGODB_URI;

// Get all department tasks
router.get('/', authenticate, async (req, res) => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const tasks = await TaskDepartment.find({})
      .populate('userID')
      .populate('departmentID');
    res.json(tasks);
  } catch (err) {
    console.error('Error retrieving department tasks:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new department task
router.post('/', authenticate, async (req, res) => {
  const task = new TaskDepartment({
    userID: req.body.userID,
    departmentID: req.body.departmentID,
    name: req.body.name,
    hours_worked: req.body.hours_worked,
    approved: req.body.approved || false
  });

  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error creating department task:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update a department task
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const task = await TaskDepartment.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.body.name) task.name = req.body.name;
    if (req.body.hours_worked) task.hours_worked = req.body.hours_worked;
    if (req.body.approved !== undefined) task.approved = req.body.approved;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a department task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await TaskDepartment.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Department task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get tasks by department
router.get('/department/:departmentId', authenticate, async (req, res) => {
  try {
    const tasks = await TaskDepartment.find({ departmentID: req.params.departmentId })
      .populate('userID')
      .populate('departmentID');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;