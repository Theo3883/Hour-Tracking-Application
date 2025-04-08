import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { authenticateWithBackend } from '@/utils/auth-helpers'

// Export the User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  departmentID: string;
  role: string;
  image?: string;
  _id?: string;
}

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

function SessionConsumer({ setUser, setLoading }: {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}) {
  const { data: session, status } = useSession();
  const [backendAuthenticated, setBackendAuthenticated] = useState(false);

  useEffect(() => {
    const authenticateUser = async () => {
      if (status === 'authenticated' && session?.user?.email && !backendAuthenticated) {
        try {
          // This will create JWT token for backend auth
          const userData = await authenticateWithBackend(session.user.email);
          
          if (userData && userData.user) {
            // Update user with data from backend
            setUser({
              id: userData.user.id,
              _id: userData.user.id,
              email: userData.user.email,
              firstName: userData.user.firstName,
              lastName: userData.user.lastName,
              name: `${userData.user.firstName} ${userData.user.lastName}`,
              departmentID: userData.user.departmentID,
              role: userData.user.role,
              image: session.user.image ?? undefined
            });
            
            setBackendAuthenticated(true);
          }
        } catch (error) {
          console.error("Failed to authenticate with backend:", error);
          // Still set user with session data even if backend auth fails
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.name?.split(' ')[0] || '',
            lastName: session.user.name?.split(' ')[1] || '',
            name: session.user.name || '',
            departmentID: session.user.departmentID || '',
            role: session.user.role || 'user',
            image: session.user.image ?? undefined
          });
        }
      } else if (status === 'unauthenticated') {
        localStorage.removeItem('token');
        setUser(null);
      }
      
      setLoading(status === 'loading');
    };
    
    authenticateUser();
  }, [session, status, setUser, setLoading, backendAuthenticated]);
  
  return null;
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      <SessionConsumer setUser={setUser} setLoading={setLoading} />
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};