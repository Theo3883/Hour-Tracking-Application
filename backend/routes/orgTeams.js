const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const OrgTeam = require("../models/OrgTeam");
const { authenticate } = require("../middleware/auth");
const uri = process.env.MONGODB_URI;

// Get all org teams
router.get("/", authenticate, async (req, res) => {
  console.log("GET /orgTeams");
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const orgTeams = await OrgTeam.find({})
      .populate("userID")
      .populate("projectID");
    console.log("OrgTeams retrieved:", orgTeams);
    res.json(orgTeams);
  } catch (err) {
    console.error("Error retrieving org teams:", err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new org team
router.post("/", authenticate, async (req, res) => {
  const { userID, projectID } = req.body;

  const newOrgTeam = new OrgTeam({
    userID,
    projectID,
  });

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const savedOrgTeam = await newOrgTeam.save();
    console.log("OrgTeam created:", savedOrgTeam);
    res.status(201).json(savedOrgTeam);
  } catch (err) {
    console.error("Error creating org team:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get org team by userID and projectID
router.get("/", authenticate, async (req, res) => {
  const { userID, projectID } = req.query;

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const orgTeams = await OrgTeam.find({ userID, projectID });
    res.json(orgTeams);
  } catch (err) {
    console.error("Error retrieving org teams:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get org team by userID only
router.post("/byUser", authenticate, async (req, res) => {
  const { userID } = req.body;

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const orgTeams = await OrgTeam.find({ userID }).populate("projectID");
    res.json(orgTeams);
  } catch (err) {
    console.error("Error retrieving org teams:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get org teams by projectID
router.post("/byProject", authenticate, async (req, res) => {
  const { projectID } = req.body;

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const orgTeams = await OrgTeam.find({ projectID }).populate("userID");
    res.json(orgTeams);
  } catch (err) {
    console.error("Error retrieving org teams:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete a user from org team
router.delete('/delete', authenticate, async (req, res) => {
  const { userID, projectID } = req.body;

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const deletedOrgTeam = await OrgTeam.findOneAndDelete({ 
      userID: userID, 
      projectID: projectID 
    });

    if (!deletedOrgTeam) {
      return res.status(404).json({ message: 'OrgTeam member not found' });
    }

    res.json({ message: 'Member removed from team successfully' });
  } catch (err) {
    console.error('Error removing team member:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
