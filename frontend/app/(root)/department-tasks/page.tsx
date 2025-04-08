'use client'

import DepartmentTaskEntry from '@/components/DepartmentTaskEntry';
import { useSearchParams } from 'next/navigation';

const DepartmentTasksPage = () => {
  const searchParams = useSearchParams();
  const department = searchParams?.get('department') || '';

  return <DepartmentTaskEntry departmentID={department} />;
};

export default DepartmentTasksPage;