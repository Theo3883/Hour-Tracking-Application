'use client'

import { useEffect, useState } from 'react';
import { fetchProjects, updateCoordinator } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { type Project } from "@/context/ProjectContext";

const UpdateCoordinator = () => {
  const [projects, setProjects] = useState([]);
  const [email, setEmail] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchAllProjects();
  }, []);

  const handleUpdate = async () => {
    try {
      const data = await updateCoordinator(email, selectedProject);
      setMessage(data.message || 'Coordinator updated successfully');
    } catch (error) {
      console.error('Error updating coordinator:', error);
      setMessage('An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto mt-4">
        <CardHeader>
          <CardTitle>Update Coordinator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Select Project:</Label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a project</option>
              {projects.map((project: Project) => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Coordinator Email:</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter coordinator email"
            />
          </div>
          <Button onClick={handleUpdate} variant="custom" className="w-full">Update Coordinator</Button>
          {message && <p className="text-center mt-4">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateCoordinator;