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
import {
  fetchOrgTeamsByProject,
  fetchDepartmentMembers,
  deleteUserFromOrgTeam,
  deleteTask,
  fetchTasks,
  fetchTasksByDepartment,
  deleteDepartmentTask
} from "../utils/api";
import LoadingBar from "./LoadingBar";
import AddUserToOrgTeam from "./AddUserToOrgTeam";
import AddUserToDepartment from "./AddUserToDepartment";
import type { Task } from "@/context/TaskContext";
import { type OrgTeam } from "@/context/OrgTeamContext";
interface TeamMembersTableProps {
  entityId: string; // Can be projectID or departmentID
  type: "project" | "department";
  title?: string;
}

interface Member {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  departmentID?: string;
}
const TeamMembersTable = ({ entityId, type, title }: TeamMembersTableProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (type === "project") {
          const orgTeams = await fetchOrgTeamsByProject(entityId);
          setMembers(orgTeams.map((team:OrgTeam) => team.userID));
        } else {
          /* department */
          const departmentMembers = await fetchDepartmentMembers(entityId);
          setMembers(departmentMembers);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching members:", error);
        setLoading(false);
      }
    };

    if (entityId) {
      fetchMembers();
    }
  }, [entityId, type]);


  const handleRemoveMember = async (memberId: string) => {
    try {
      // Delete member from team
      if (type === "project") {
        await deleteUserFromOrgTeam(memberId, entityId);
        // Delete all tasks associated with this user in this project
        const tasks = await fetchTasks(entityId);
        const memberTasks = tasks.filter(
          (task:Task) => task.userID._id === memberId
        );
        await Promise.all(memberTasks.map((task:Task) => deleteTask(task._id)));
      } else {
        // Handle department member removal
        const departmentTasks = await fetchTasksByDepartment(entityId);
        const memberTasks = departmentTasks.filter(
          (task:Task) => task.userID._id === memberId
        );
        await Promise.all(
          memberTasks.map((task:Task) => deleteDepartmentTask(task._id))
        );
      }

      // Update UI
      setMembers(members.filter((member) => member._id !== memberId));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      if (type === "project") {
        const orgTeams = await fetchOrgTeamsByProject(entityId);
        setMembers(orgTeams.map((team:OrgTeam) => team.userID));
      } else {
        const departmentMembers = await fetchDepartmentMembers(entityId);
        const filteredMembers = departmentMembers.filter((user: Member | null) => user !== null);
          
        setMembers(filteredMembers);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };
  if (loading) {
    return <LoadingBar />;
  }
  console.log("members:",members);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {title ||
            `${type === "project" ? "Project" : "Department"} Team Members`}
        </CardTitle>
        {type === "project" ? (
          <AddUserToOrgTeam projectID={entityId} onUserAdded={fetchMembers} />
        ) : (
          <AddUserToDepartment
            departmentId={entityId}
            onUserAdded={fetchMembers}
          />
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length > 0 ? (
              members.map((member) => (
                <TableRow key={member._id}>
                  <TableCell>
                    {`${member.firstName || ""} ${
                      member.lastName || ""
                    }`.trim() || "N/A"}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleRemoveMember(member._id)}
                      variant="custom_button_delete"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TeamMembersTable;
