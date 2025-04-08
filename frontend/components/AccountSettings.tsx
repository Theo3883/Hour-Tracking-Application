'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { updateUser, fetchDepartments } from '@/utils/api'
import LoadingBar from '@/components/LoadingBar'
import { useRouter } from 'next/navigation'; 
import { signOut } from "next-auth/react"; 
import { Department } from '@/context/DepartmentContext'

export default function AccountSettings() {
  const { data: session } = useSession()
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [departments, setDepartments] = useState<Department[]>([])
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    departmentID: ''
  })

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await fetchDepartments();
        setDepartments(depts);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    loadDepartments();
  }, []);

  // Fetch user data
  useEffect(() => {
    if (session?.user) {
      setIsLoading(true)
      
      // Set initial values from session if available
      const nameParts = session.user.name?.split(' ') || ['', '']
      setUserData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: session.user.email || '',
        departmentID: session.user.departmentID || ''
      })
      
      setIsLoading(false)
    }
  }, [session])

  const handleInputChange = (e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUserData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleDepartmentChange = (value: string): void => {
    setUserData(prev => ({
      ...prev,
      departmentID: value
    }))
  }

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage({ type: '', text: '' })

    try {
      await updateUser(session?.user?.id, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        departmentID: userData.departmentID
      })
      handleLogout()

    } catch (error: unknown) {
      console.error('Error updating profile:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update profile. Please try again later.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    signOut({ callbackUrl: "/login" }); 
    router.push("/login");
  };

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Account Settings</CardTitle>
          <CardDescription>
            Update your account information
          </CardDescription>
        </CardHeader>
        
        {message.text && (
          <div className={`px-6 py-2 mb-2 ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingBar />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      value={userData.email} 
                      disabled 
                      className="mt-1" 
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Your email address cannot be changed
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        value={userData.firstName} 
                        onChange={handleInputChange} 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        value={userData.lastName} 
                        onChange={handleInputChange} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      name="department"
                      value={userData.departmentID}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="w-full p-2 border rounded mt-1"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-orange-500 mt-1">
                      Warning: Changing department will remove all your tasks from your previous department
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-end border-t p-6">
            <Button type="submit"
            variant="custom" disabled={isLoading || isSaving}>
              {isSaving && <div className="mr-2"><LoadingBar/></div>}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}