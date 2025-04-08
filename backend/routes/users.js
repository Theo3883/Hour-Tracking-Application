const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const Department = require('../models/Department'); 
const { generateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const uri = process.env.MONGODB_URI;

// User signup
router.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName, department, role } = req.body; 
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Find the department by name
    const departmentDoc = await Department.findOne({ name: department });
    if (!departmentDoc) {
      return res.status(400).json({ message: 'Department not found' });
    }

    const userID = uuidv4();
    const user = new User({
      userID,
      email,
      password,
      firstName,
      lastName,
      departmentID: departmentDoc._id, 
      role
    });

    const newUser = await user.save();
    const token = generateToken(newUser);
    res.status(201).json({ token });
  } catch (err) {
    console.error('Error signing up:', err);
    res.status(500).json({ message: err.message });
  }
});


// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Find user and populate department info
    const user = await User.findOne({ email });
    
    // Separate checks for better error messages
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate token if credentials are valid
    const token = generateToken(user);
    res.json({ token });

  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google login - create user if doesn't exist
router.post('/googleLogin', async (req, res) => {
  try {
    const { email, name } = req.body;
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    // Find user by email
    let user = await User.findOne({ email });
    
    if (!user) {
      // User doesn't exist - create a new user
      console.log('Creating new user from Google login:', email);
      
      // Parse name from Google profile - handle potential null/undefined values
      const names = name?.split(' ') || ['New', 'User'];
      const firstName = names[0] || 'New'; // Default firstName if somehow empty
      // Make sure lastName is always populated with a value
      let lastName = names.length > 1 ? names.slice(1).join(' ') : 'User';
      
      // Ensure lastName is not empty
      if (!lastName || lastName.trim() === '') {
        lastName = 'User';
      }
      
      // Get the department
      const defaultDepartment = await Department.findOne({ name: "No Department" });
      if (!defaultDepartment) {
        return res.status(500).json({ message: 'No departments found for new user' });
      }
      
      // Create new user with required fields
      const userID = uuidv4();
      const randomPassword = `google-oauth-${Math.random().toString(36).substring(2, 15)}`;
      
      // Validate all required fields before creating user
      const userData = {
        userID,
        email,
        password: randomPassword,
        firstName: firstName || 'New',  
        lastName: lastName || 'User',   
        departmentID: defaultDepartment,
        role: 'user',
        googleId: email.split('@')[0] // Basic Google ID from email
      };
      
      // Additional check for required fields based on schema
      if (!userData.email) {
        return res.status(400).json({ message: 'Email is required for user creation' });
      }
      
      user = new User(userData);
      
      try {
        await user.save();
        console.log('New Google user created:', user.email);
      } catch (validationError) {
        console.error('User validation failed:', validationError);
        return res.status(400).json({ message: 'Failed to create user: ' + validationError.message });
      }
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        departmentID: user.departmentID,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  console.log('GET /users');
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const users = await User.find({}).populate('departmentID'); // Updated
    console.log('Users retrieved:', users);
    res.json(users);
  } catch (err) {
    console.error('Error retrieving users:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get users by department
router.get('/byDepartment/:departmentId', authenticate, async (req, res) => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const users = await User.find({ departmentID: req.params.departmentId });
    res.json(users);
  } catch (err) {
    console.error('Error fetching department members:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add user to department
router.post('/addToDepartment', authenticate, async (req, res) => {
  const { userId, departmentId } = req.body;

  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Update user's department
    user.departmentID = departmentId;
    await user.save();

    res.json({ 
      message: 'User added to department successfully',
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        departmentID: user.departmentID
      }
    });
  } catch (err) {
    console.error('Error adding user to department:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update user information
router.put('/update/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, departmentID } = req.body;
  console.log("/update");
  console.log("received user info:", firstName, lastName,departmentID);
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if department is being changed
    const isDepartmentChanged = departmentID && departmentID !== user.departmentID;
    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    
    // Handle department change and task cleanup
    if (isDepartmentChanged) {
      // Get old department ID for cleanup
      const oldDepartmentID = user.departmentID;
      
      // Update department
      user.departmentID = departmentID;
      
      // Save user with new department
      await user.save();
      
      // Delete all department tasks for this user in their old department
      const TaskDepartment = require('../models/TaskDepartment');
      await TaskDepartment.deleteMany({ 
        userID: user._id, 
        departmentID: oldDepartmentID 
      });
      
      res.status(200).json({
        message: 'User updated successfully and department tasks removed',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          departmentID: user.departmentID,
          role: user.role
        }
      });
    } else {
      // Standard update without department change
      await user.save();
      
      res.status(200).json({
        message: 'User updated successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          departmentID: user.departmentID,
          role: user.role
        }
      });
    }
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;