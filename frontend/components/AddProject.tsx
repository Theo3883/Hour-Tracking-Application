"use client";

import { useEffect, useState } from "react";
import { fetchUsers, addProject } from "../utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";
import type { User } from "@/context/UserContext"; 

const AddProject = () => {
  const [users, setUsers] = useState<User[]>([]); 
  const [projectName, setProjectName] = useState("");
  const [coordinatorEmail, setCoordinatorEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  const handleAddProject = async () => {
    const projectID = uuidv4();
    try {
      const user = users.find((user) => user.email === coordinatorEmail);
      if (!user) {
        setMessage("Coordinator not found");
        return;
      }
      const coordinatorID = user._id;
      const data = await addProject(projectID, projectName, coordinatorID);
      setMessage(data.message || "Project added successfully");
    } catch (error) {
      console.error("Error adding project:", error);
      setMessage("An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto mt-4">
        <CardHeader>
          <CardTitle>Add Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name:</Label>
            <Input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coordinatorEmail">Coordinator Email:</Label>
            <Input
              id="coordinatorEmail"
              type="email"
              value={coordinatorEmail}
              onChange={(e) => setCoordinatorEmail(e.target.value)}
              placeholder="Enter coordinator email"
            />
          </div>
          <Button
            onClick={handleAddProject}
            variant="custom"
            className="w-full"
          >
            Add Project
          </Button>
          {message && <p className="text-center mt-4">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProject;
