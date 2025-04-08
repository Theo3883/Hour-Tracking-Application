'use client'

import { useSearchParams } from 'next/navigation';
import AddUserToOrgTeam from '@/components/AddUserToOrgTeam';

const AddUserToOrgTeamPage = () => {
  const searchParams = useSearchParams();
  const projectID = searchParams?.get('projectID') || '';

  return <AddUserToOrgTeam projectID={projectID} />;
};

export default AddUserToOrgTeamPage;