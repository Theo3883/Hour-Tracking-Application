"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { fetchAllTasks, fetchTasksByDepartment } from "@/utils/api";
import LoadingBar from "@/components/LoadingBar";
import { useSession } from "next-auth/react";
import { fetchDepartments } from "../../../utils/api";
import { Department } from "@/context/DepartmentContext";


interface Task {
  _id: string;
  name: string;
  hours_worked: number;
  approved: boolean;
  userID: {
    _id: string;
    firstName?: string;
    lastName?: string;
  };
  projectID?: string;
  departmentID?: string;
}

const fetchUserDepartmentName = async (departmentId: string) => {
  try {
    const departments = await fetchDepartments();
    const userDepartment = departments.find(
      (department: Department) => department._id === departmentId
    );
    if (userDepartment) {
      return userDepartment.name;
    }
    return "";
  } catch (error) {
    console.error("Error fetching department name:", error);
    return "";
  }
};

export default function HomePage() {
  const { user } = useUser();
  const [hours, setHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userDepartmentName, setUserDepartmentName] = useState("");
  const { data: session, status } = useSession();

  console.log("session is:",session);
  
  useEffect(() => {
    const checkTokenAndFetchDepartmentName = async () => {
      if (status === "authenticated" && session?.user?.departmentID) {
        const token = localStorage.getItem("token");
        if (token) {
          const departmentName = await fetchUserDepartmentName(session.user.departmentID);
          setUserDepartmentName(departmentName);
          setIsLoading(false);
        }
      }
    };

    if (status === "loading" && localStorage.getItem("token") === null) {
      setIsLoading(true);
    } else {
      checkTokenAndFetchDepartmentName();
    }
  }, [session, status]);


  useEffect(() => {
    const calculateApprovedHours = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const projectTasks = await fetchAllTasks();
        const userApprovedProjectHours = projectTasks
          .filter((task: Task) => task.userID._id === user.id && task.approved)
          .reduce((sum: number, task: Task) => sum + task.hours_worked, 0);

        const departmentTasks = await fetchTasksByDepartment(user.departmentID);
        const userApprovedDepartmentHours = departmentTasks
          .filter((task: Task) => task.userID._id === user.id && task.approved)
          .reduce((sum: number, task: Task) => sum + task.hours_worked, 0);

        setHours(userApprovedProjectHours + userApprovedDepartmentHours);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateApprovedHours();
  }, [user]);

  if (isLoading) {
    return <LoadingBar />;
  }
  return (
    <div className="p-6">
      {/* User Info */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Bine ai revenit, {user?.name}</h1>
        <p className="text-gray-600">
          Aici vei găsi toate informațiile necesare pentru a te orienta.
        </p>
      </div>

      {/* Info Card */}
      <Card className="max-w-5xl">
        <CardContent className="pt-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold mb-4">Informațiile tale</h2>
            <ul className="space-y-2">
              <li>
                Faci parte din departamentul{" "}
                <span className="text-blue-500">{userDepartmentName}</span>
              </li>
              <li>
                Ai <span className="font-semibold">{hours}</span> ore aprobate
              </li>
            </ul>
          </div>
          <Avatar className="h-12 w-12 bg-blue-300">
            {session?.user.image && (
              <AvatarImage
                src={session?.user.image}
                alt={`${session?.user.name}'s profile picture`}
              />
            )}
            <AvatarFallback className="text-primary-foreground text-black">
              {}
            </AvatarFallback>
          </Avatar>
        </CardContent>
      </Card>
    </div>
  );
}