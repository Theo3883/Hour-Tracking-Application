'use client'

import { useSearchParams } from 'next/navigation';
import TeamMembersTable from '@/components/TeamMembersTable';

export default function ProjectTeamPage() {
  const searchParams = useSearchParams();
  const projectID = searchParams?.get('projectID') || '';

  return <TeamMembersTable entityId={projectID} type="project" />;
}