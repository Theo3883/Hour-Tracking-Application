'use client'

import CoordinatorTasks from '@/components/CoordinatorTasks';
import { useSearchParams } from 'next/navigation';

const CoordinatorTasksPage = () => {
  const searchParams = useSearchParams();
  const projectID = searchParams?.get('projectID') || '';

  return <CoordinatorTasks projectID={projectID} />;
};

export default CoordinatorTasksPage;