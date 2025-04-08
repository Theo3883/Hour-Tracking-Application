require('dotenv').config();
const express = require('express');

const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs')
const https = require('https')


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());


// Middleware
app.use(bodyParser.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 30000, // Increase connection timeout to 30 seconds
  socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Task routes
const taskRoutes = require('./routes/tasks');
app.use('/tasks', taskRoutes);

// User routes
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

// Project routes
const projectRoutes = require('./routes/projects');
app.use('/projects', projectRoutes);

//OrgTeams
const orgTeamRoutes = require('./routes/orgTeams');
app.use('/orgTeams',orgTeamRoutes)

//Departments
const departmentRoutes = require('./routes/departments');
app.use('/departments', departmentRoutes);

//Departments Tasks
const taskDepartmentRoutes = require('./routes/taskDepartments');
app.use('/taskDepartments', taskDepartmentRoutes);

// Hello World route
const helloRoutes = require('./routes/hello');
app.use('/hello', helloRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});