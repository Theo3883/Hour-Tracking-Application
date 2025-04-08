"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchTasks,
  fetchTasksByDepartment,
  fetchDepartments,
  fetchDepartmentMembers,
} from "../utils/api";
import LoadingBar from "./LoadingBar";
import PdfGenerator from './PdfGenerator';
import type { Task } from "@/context/TaskContext";
import { type Department } from '@/context/DepartmentContext';
import { User } from "@/context/UserContext";

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalHours: number;
  projectHours: number;
  departmentHours: number;
}

interface DepartmentStats {
  departmentName: string;
  members: Member[];
}

const TopActiveMembers = () => {
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize member stats for a department - includes all members, not just those with tasks
    const initializeMemberStats = async (departmentId: string) => {
      const departmentMembers = await fetchDepartmentMembers(departmentId);
      const memberStats = new Map<string, Member>();
      
      // Initialize all department members first
      departmentMembers.forEach((member: User) => {
        if (member && member._id) {
          memberStats.set(member._id, {
            _id: member._id,
            firstName: member.firstName || "",
            lastName: member.lastName || "",
            email: member.email || "",
            totalHours: 0,
            projectHours: 0,
            departmentHours: 0,
          });
        }
      });
      
      return memberStats;
    };

    // Process department tasks
    const processDepartmentTasks = async (departmentId: string, memberStats: Map<string, Member>) => {
      const departmentTasks = await fetchTasksByDepartment(departmentId);
      
      departmentTasks.forEach((task: Task) => {
        if (task.approved && task.userID) {
          const userId = task.userID._id;
          
          // Create new member entry if not exists
          if (!memberStats.has(userId)) {
            memberStats.set(userId, {
              _id: userId,
              firstName: task.userID.firstName || "",
              lastName: task.userID.lastName || "",
              email: task.userID.email || "",
              totalHours: 0,
              projectHours: 0,
              departmentHours: 0,
            });
          }
          
          const member = memberStats.get(userId)!;
          member.departmentHours += task.hours_worked;
          member.totalHours += task.hours_worked;
        }
      });
    };

    // Process project tasks - FIXED to only count project tasks for department members
    const processProjectTasks = async (memberStats: Map<string, Member>) => {
      const projectTasks = await fetchTasks("");
      
      projectTasks.forEach((task: Task) => {
        if (task.approved && task.userID) {
          const userId = task.userID._id;
          
          if (memberStats.has(userId)) {
            const member = memberStats.get(userId)!;
            member.projectHours += task.hours_worked;
            member.totalHours += task.hours_worked;
          }
        }
      });
    };

    const fetchAllStats = async () => {
      try {
        // Fetch all departments
        const departments = await fetchDepartments();
        const statsPromises = departments.map(async (department: Department) => {
          // Initialize member stats with all department members
          const memberStats = await initializeMemberStats(department._id);
          
          // Process department tasks
          await processDepartmentTasks(department._id, memberStats);
          
          // Process all project tasks 
          await processProjectTasks(memberStats);
          
          // Convert to array, sort by total hours, and get top 5
          const sortedMembers = Array.from(memberStats.values())
            .filter(member => member.totalHours > 0) // Only include members with hours
            .sort((a, b) => b.totalHours - a.totalHours)
            .slice(0, 5);
          
          return {
            departmentName: department.name,
            members: sortedMembers,
          };
        });

        const allStats = await Promise.all(statsPromises);
        setDepartmentStats(allStats);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  if (loading) {
    return <LoadingBar />;
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-end mb-4">
        <PdfGenerator
          fileName="department-activity-report.pdf"
          title="Department Activity Report"
          sections={departmentStats.map((stats) => ({
            title: stats.departmentName,
            data: stats.members.map(member => ({
              firstName: member.firstName,
              lastName: member.lastName,
              projectHours: member.projectHours,
              departmentHours: member.departmentHours,
              totalHours: member.totalHours
            })),
            columns: [
              { key: "firstName", header: "First Name", width: 2 },
              { key: "lastName", header: "Last Name", width: 2 },
              { key: "projectHours", header: "Project Hours", width: 1 },
              { key: "departmentHours", header: "Department Hours", width: 1 },
              { key: "totalHours", header: "Total Hours", width: 1 },
            ],
          }))}
        />
      </div>
      {departmentStats.map((stats) => (
        <Card key={stats.departmentName} className="w-full">
          <CardHeader>
            <CardTitle>{stats.departmentName}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Project Hours</TableHead>
                  <TableHead className="text-right">Department Hours</TableHead>
                  <TableHead className="text-right">Total Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.members.length > 0 ? (
                  stats.members.map((member) => (
                    <TableRow key={`${stats.departmentName}-${member._id}`}>
                      <TableCell className="font-medium">
                        {`${member.firstName} ${member.lastName}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.projectHours}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.departmentHours}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {member.totalHours}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No active members in this department
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TopActiveMembers;