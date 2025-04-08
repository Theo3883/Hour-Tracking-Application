"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchTasks, updateTask, deleteTask } from "../utils/api";
import LoadingBar from "./LoadingBar";
import { useTask } from "@/context/TaskContext";
import type { Task } from "@/context/TaskContext";
interface CoordinatorTasksProps {
  projectID: string;
}

const CoordinatorTasks = ({ projectID }: CoordinatorTasksProps) => {
  const { tasks, setTasks } = useTask();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectTasks = async () => {
      try {
        const allTasks = await fetchTasks(projectID);
        const projectTasks = allTasks.filter(
          (task : Task) =>
            (typeof task.projectID === "object" &&
              task.projectID._id === projectID)
        );
        setTasks(projectTasks);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    };

    if (projectID) {
      fetchProjectTasks();
    }
  }, [projectID, setTasks]);

  const handleApproveTask = async (
    taskId: string,
    currentApproved: boolean
  ) => {
    try {
      await updateTask(taskId, { approved: !currentApproved });
      setTasks(
        tasks.map((task) =>
          task._id === taskId ? { ...task, approved: !currentApproved } : task
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await deleteTask(taskId);
      if (response.message === "Task deleted") {
        setTasks(tasks.filter((task) => task._id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (loading) {
    return <LoadingBar />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Project Tasks Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell>
                    {`${task.userID.firstName || ""} ${
                      task.userID.lastName || ""
                    }`.trim() || "Unknown User"}
                  </TableCell>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{task.hours_worked}</TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        task.approved
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {task.approved ? "Approved" : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      onClick={() => handleApproveTask(task._id, task.approved)}
                      variant={
                        task.approved
                          ? "custom_button_delete"
                          : "custom_button_approve"
                      }
                      size="sm"
                    >
                      {task.approved ? "Revoke" : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleDeleteTask(task._id)}
                      variant="custom_button_delete"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No tasks found for this project
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CoordinatorTasks;
