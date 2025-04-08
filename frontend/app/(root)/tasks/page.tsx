'use client'

import TaskEntry from '@/components/TaskEntry';
import { useSearchParams } from 'next/navigation';

const TaskEntryPage = () => {
  const searchParams = useSearchParams();
  const projectID = searchParams?.get('projectID') || '';

  return <TaskEntry projectID={projectID} />;
};

export default TaskEntryPage;