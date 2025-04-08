const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Department = require('../models/Department');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const uri = process.env.MONGODB_URI;

// Fetch all departments
router.get('/', authenticate, async (req, res) => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const departments = await Department.find({});
    res.json(departments);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add department coordinator
router.post('/addCoordinator', authenticate, async (req, res) => {
  const { email, departmentID } = req.body;

  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const department = await Department.findById(departmentID);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    department.coordinatorID = user._id;
    await department.save();

    res.status(200).json({ message: 'Coordinator added successfully' });
  } catch (err) {
    console.error('Error adding coordinator:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;