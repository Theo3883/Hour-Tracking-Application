import { MongoDBAdapter } from "@auth/mongodb-adapter";
// Use regular import instead of 'import type'

import clientPromise from "./mongodbClient";
import { ObjectId } from "mongodb";

// Custom adapter to handle department and role
export function CustomMongoDBAdapter() {
  const adapter = MongoDBAdapter(clientPromise);
  
  // Extend the createUser function to set default department and role
  const originalCreateUser = adapter.createUser;
  adapter.createUser = async (user) => {
    // Get the default department ID
    const client = await clientPromise;
    const db = client.db();
    const defaultDepartment = await db.collection("departments").findOne({ name: "No Department" });
    
    // Set default values for our custom fields
    const newUser = await originalCreateUser({
      ...user,
      departmentID: defaultDepartment ? new ObjectId(defaultDepartment._id) : null,
      role: "user",
      firstName: user.name?.split(" ")[0] || "",
      lastName: user.name?.split(" ")[1] || "",
    });
    
    return newUser;
  };
  
  return adapter;
}