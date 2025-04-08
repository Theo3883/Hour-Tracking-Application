import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { fetchTasks, addTask, deleteTask } from '../utils/api';
import { useUser } from "@/context/UserContext";
import LoadingBar from './LoadingBar';
import type { Task } from "@/context/TaskContext";

const splitTaskName = (name: string, chunkSize: number = 10) => {
  const chunks = [];
  for (let i = 0; i < name.length; i += chunkSize) {
    chunks.push(name.slice(i, i + chunkSize));
  }
  return chunks;
};

interface TaskEntryProps {
  projectID: string;
}

const TaskEntry = ({ projectID }: TaskEntryProps) => {
  const { user } = useUser();
  const [tasks, setTasks] = useState<{ _id: string; name: string; hours_worked: number; approved: boolean }[]>([]);
  const [taskName, setTaskName] = useState("");
  const [hoursWorked, setHoursWorked] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const cardContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjectTasks = async () => {
      if (!user) return;
      
      try {
        const allTasks = await fetchTasks(projectID);
        const userTasks = allTasks.filter(
          (task:Task) => task.userID._id === user.id
        );
        setTasks(userTasks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    };

    fetchProjectTasks();
  }, [projectID, user]); // Added user to dependencies
  useEffect(() => {
    const handleScroll = () => {
      if (cardContentRef.current) {
        if (cardContentRef.current.scrollTop > 0) {
          cardContentRef.current.classList.add("custom-scrollbar-dense");
        } else {
          cardContentRef.current.classList.remove("custom-scrollbar-dense");
        }
      }
    };

    const cardContentElement = cardContentRef.current;
    if (cardContentElement) {
      cardContentElement.addEventListener("scroll", handleScroll);
      return () => {
        cardContentElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const handleAddTask = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    if (taskName && hoursWorked !== "") {
      const newTask = { 
        name: taskName, 
        hours_worked: Number(hoursWorked), 
        approved: false, 
        projectID,
        userID: user.id
      };
      
      try {
        const createdTask = await addTask(newTask);
        setTasks([...tasks, createdTask]);
        setTaskName("");
        setHoursWorked("");
      } catch (error) {
        console.error('Error creating task:', error);
      }
    }
  };

  const handleDeleteTask = async (index: number) => {
    const task = tasks[index];
  
    try {
      const response = await deleteTask(task._id);
      if (response.message === 'Task deleted') {
        const newTasks = tasks.filter((_, i) => i !== index);
        setTasks(newTasks);
      } else {
        console.error('Error deleting task:', response.message);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return <LoadingBar />;
  }

  const totalHours = tasks.reduce((sum, task) => task.approved ? sum + task.hours_worked : sum, 0);

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent ref={cardContentRef} className="space-y-4 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <div className="space-y-2">
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Task Name"
          />
          <Input
            type="number"
            value={hoursWorked}
            onChange={(e) => setHoursWorked(e.target.value ? Number(e.target.value) : "")}
            placeholder="Hours Worked"
          />
          <Button onClick={handleAddTask} variant="custom" className="w-full">Add Task</Button>
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Total Hours Worked: {totalHours}</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task, index) => (
              <TableRow key={index}>
                <TableCell>
                  {splitTaskName(task.name).map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </TableCell>
                <TableCell>{task.hours_worked}</TableCell>
                <TableCell>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full cursor-pointer",
                      task.approved ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="custom_button_delete" onClick={() => handleDeleteTask(index)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TaskEntry;