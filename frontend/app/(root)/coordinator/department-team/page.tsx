'use client'

import { useSearchParams } from 'next/navigation';
import TeamMembersTable from '@/components/TeamMembersTable';

export default function DepartmentTeamPage() {
  const searchParams = useSearchParams();
  const departmentID = searchParams?.get('departmentID') || '';

  return <TeamMembersTable entityId={departmentID} type="department" />;
}