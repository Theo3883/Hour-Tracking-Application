'use client'

import { useEffect, useState } from 'react';
import { fetchDepartments, addDepartmentCoordinator } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/UserContext';
import LoadingBar from './LoadingBar';

interface Department {
  _id: string;
  name: string;
  coordinatorID: string;
}
 
const AddDepartmentCoordinator = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [email, setEmail] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllDepartments = async () => {
      try {
        const data = await fetchDepartments();
        setDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    if (user) {
      fetchAllDepartments();
      setLoading(false);
    }
  }, [user]);

  const handleAddCoordinator = async () => {
    try {
      const data = await addDepartmentCoordinator(email, selectedDepartment);
      setMessage(data.message || 'Coordinator added successfully');
    } catch (error) {
      console.error('Error adding coordinator:', error);
      setMessage('An error occurred');
    }
  };

  if (loading) {
    return <LoadingBar />;
  }

  if (!user) {
    return <div>Please log in to add a department coordinator.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto mt-4">
        <CardHeader>
          <CardTitle>Add Department Coordinator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="department">Select Department:</Label>
            <select
              id="department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a department</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
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
          <Button onClick={handleAddCoordinator} variant="custom" className="w-full">
            Add Coordinator
          </Button>
          {message && <p className="text-center mt-4">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDepartmentCoordinator;