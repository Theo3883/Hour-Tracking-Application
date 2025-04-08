'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  departmentID: string;
  role?: string;
  iat: number;
  exp: number;
}

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
      } else {
        setUser({
          id: decodedToken.id,
          firstName:decodedToken.firstName || "undefined",
          lastName: decodedToken.lastName || "undefined",
          name: `${decodedToken.firstName || ''} ${decodedToken.lastName || ''}`.trim(),
          email: decodedToken.email,
          departmentID: decodedToken.departmentID,
          role: decodedToken.role || 'user', // Add default value 'user'
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error decoding JWT:', error);
      localStorage.removeItem('token');
      setUser(null);
      router.push('/login');
    }
  }, [router, setUser]);

  if (loading || !user) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
};

export default AuthGuard;