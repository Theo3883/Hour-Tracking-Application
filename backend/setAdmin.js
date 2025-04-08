const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function setAdminByEmail(email) {
  if (!email) {
    console.error('Error: Email is required');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`Error: No user found with email ${email}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    // Update user role to admin
    console.log('\n⚠️  WARNING: This will set this user as admin!');
    console.log('Press Ctrl+C to cancel or wait 3 seconds to continue...');
    
    // Wait for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Set role to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`\nSuccessfully updated user ${user.email} to role: ${user.role}`);

  } catch (error) {
    console.error('Error setting admin role:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Get email from command line arguments
const email = process.argv[2];

// Run the function
setAdminByEmail(email);