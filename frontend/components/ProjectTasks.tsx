'use client'

import { useEffect, useState } from 'react';
import TaskEntry from './TaskEntry';
import { fetchOrgTeamsByUser } from '../utils/api';

interface ProjectTasksProps {
  userID: string;
  projectID: string;
}

interface OrgTeam {
  projectID: {
    _id: string;
  };
}

const ProjectTasks = ({ userID, projectID }: ProjectTasksProps) => {
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const checkMembership = async () => {
      try {
        const data = await fetchOrgTeamsByUser(userID);
        const isUserMember = data.some((team: OrgTeam) => team.projectID._id === projectID);
        setIsMember(isUserMember);
      } catch (error) {
        console.error('Error checking membership:', error);
      }
    };

    checkMembership();
  }, [userID, projectID]);

  if (!isMember) {
    return null;
  }

  return <TaskEntry projectID={projectID} />;
};

export default ProjectTasks;