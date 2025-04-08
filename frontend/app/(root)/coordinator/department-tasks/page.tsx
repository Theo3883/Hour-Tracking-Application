'use client'

import DepartmentTasks from '@/components/DepartmentTasks';
import { useSearchParams } from 'next/navigation';

const DepartmentTasksPage = () => {
  const searchParams = useSearchParams();
  const departmentID = searchParams?.get('departmentID') || '';

  return <DepartmentTasks departmentID={departmentID} />;
};

export default DepartmentTasksPage;