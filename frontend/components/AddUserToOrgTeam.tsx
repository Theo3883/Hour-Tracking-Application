"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchUsers, addUserToOrgTeam } from "@/utils/api";
import { User, useUser } from "@/context/UserContext";

interface AddUserToOrgTeamTestProps {
  projectID: string;
  onUserAdded?: () => void;
}

const AddUserToOrgTeamTest = ({
  projectID,
  onUserAdded,
}: AddUserToOrgTeamTestProps) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]); 
  const { user } = useUser();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (user) {
      fetchAllUsers();
    }
  }, [user]);

  const handleAddUser = async () => {
    try {
      const userToAdd = users.find((user: User) => user.email === email); 
      if (!userToAdd) {
        setMessage("User not found");
        return;
      }
      const userID = userToAdd._id;
      const data = await addUserToOrgTeam(userID!, projectID);
      setMessage(data.message || "User added to OrgTeam successfully");
      setEmail(""); // Reset email field
      if (onUserAdded) {
        onUserAdded();
      }
    } catch (error) {
      console.error("Error adding user to OrgTeam:", error);
      setMessage("An error occurred");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="custom" className="mb-4">
          Add Team Member
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Team Member</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the email address of the user you want to add to the team.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
            />
          </div>
          {message && <p>{message}</p>}
        </div>
        <AlertDialogFooter className="sm:justify-start">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="custom" onClick={handleAddUser}>
              Add Member
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddUserToOrgTeamTest;
