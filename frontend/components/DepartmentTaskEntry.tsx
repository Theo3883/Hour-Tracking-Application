"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import {
  fetchTasksByDepartment,
  addDepartmentTask,
  deleteDepartmentTask,
} from "../utils/api";
import LoadingBar from "./LoadingBar";
import { useTask, type Task } from "@/context/TaskContext";

// Utility function to split task name into chunks of 10 characters
const splitTaskName = (name: string, chunkSize: number = 10) => {
  const chunks = [];
  for (let i = 0; i < name.length; i += chunkSize) {
    chunks.push(name.slice(i, i + chunkSize));
  }
  return chunks;
};

interface DepartmentTaskEntryProps {
  departmentID: string;
  title?: string;
  isCoordinator?: boolean;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskApprove?: (taskId: string, approved: boolean) => void;
  className?: string;
  maxHeight?: string;
}

const DepartmentTaskEntry = ({
  departmentID,
  title = "Department Tasks",
  className,
  maxHeight = "calc(100vh - 300px)",
}: DepartmentTaskEntryProps) => {
  const { user } = useUser();
  const { tasks, setTasks } = useTask();
  const [taskName, setTaskName] = useState("");
  const [hoursWorked, setHoursWorked] = useState<number | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartmentTasks = async () => {
      if (!user) return;

      try {
        const allTasks = await fetchTasksByDepartment(departmentID);
        // Filter tasks for current user
        const userTasks = allTasks.filter(
          (task: Task) => {
            return task.userID._id === user.id;
          }
        );
        setTasks(userTasks);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching department tasks:", error);
        setTasks([]); // Set empty array on error
        setLoading(false);
      }
    };

    fetchDepartmentTasks();
  }, [departmentID, user, setTasks]);

  const handleAddTask = async () => {
    if (!user) {
      console.error("No user found");
      return;
    }

    if (taskName && hoursWorked !== "") {
      const newTask = {
        name: taskName,
        hours_worked: Number(hoursWorked),
        approved: false,
        departmentID,
        userID: user.id,
      };

      try {
        const createdTask = await addDepartmentTask(newTask);
        setTasks([...tasks, createdTask]);
        setTaskName("");
        setHoursWorked("");
      } catch (error) {
        console.error("Error creating department task:", error);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await deleteDepartmentTask(taskId);
      if (response.message === "Department task deleted") {
        setTasks(tasks.filter((task) => task._id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting department task:", error);
    }
  };

  if (loading) {
    return <LoadingBar />;
  }

  const totalHours = tasks.reduce(
    (sum, task) => (task.approved ? sum + task.hours_worked : sum),
    0
  );

  return (
    <Card className={`w-full max-w-md mx-auto mt-4 ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent
        className="space-y-4 overflow-y-auto custom-scrollbar"
        style={{ maxHeight }}
      >
        <div className="space-y-2">
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Task Name"
          />
          <Input
            type="number"
            value={hoursWorked}
            onChange={(e) =>
              setHoursWorked(e.target.value ? Number(e.target.value) : "")
            }
            placeholder="Hours Worked"
          />
          <Button onClick={handleAddTask} variant="custom" className="w-full">
            Add Task
          </Button>
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold">
            Total Hours Worked: {totalHours}
          </h2>
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
            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>
                  {splitTaskName(task.name).map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </TableCell>
                <TableCell>{task.hours_worked}</TableCell>
                <TableCell>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full",
                      task.approved ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="custom_button_delete"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DepartmentTaskEntry;
