import { createContext, useContext, useState, ReactNode } from 'react';

export interface Project {
  _id: string;
  name: string;
  coordinatorID: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface ProjectContextProps {
  projectLinks: Project[];
  setProjectLinks: (projects: Project[]) => void;
}

const ProjectContext = createContext<ProjectContextProps>({
  projectLinks: [],
  setProjectLinks: () => {}
});

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectLinks, setProjectLinks] = useState<Project[]>([]);

  return (
    <ProjectContext.Provider value={{ projectLinks, setProjectLinks }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};