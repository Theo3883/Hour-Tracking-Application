import { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  _id: string;
  userID: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  projectID: {
    _id: string;
    name?: string;
  };
  name: string;
  hours_worked: number;
  approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TaskContextProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Task) => {
    setTasks(prevTasks => [...prevTasks, task]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
  };

  const value = {
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext;