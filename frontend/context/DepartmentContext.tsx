import { createContext, useContext, useState, ReactNode } from 'react';

export interface Department {
  _id: string;
  name: string;
  coordinatorID: string;
}

interface DepartmentContextProps {
  departments: Department[];
  setDepartments: (departments: Department[]) => void;
}

const DepartmentContext = createContext<DepartmentContextProps>({
  departments: [],
  setDepartments: () => {}
});

export const DepartmentProvider = ({ children }: { children: ReactNode }) => {
  const [departments, setDepartments] = useState<Department[]>([]);

  return (
    <DepartmentContext.Provider value={{ departments, setDepartments }}>
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }
  return context;
};

export default DepartmentContext;