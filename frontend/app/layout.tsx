"use client";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { UserProvider } from "@/context/UserContext";
import { TaskProvider } from "@/context/TaskContext";
import { OrgTeamProvider } from '@/context/OrgTeamContext';
import { ProjectProvider } from '@/context/ProjectContext';
import LoadingBar from '@/components/LoadingBar';
import { Suspense } from 'react';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <UserProvider>
            <TaskProvider>
              <OrgTeamProvider>
                <ProjectProvider>
                <Suspense fallback={<LoadingBar />}>
                  {children}
                  </Suspense>
                </ProjectProvider>
              </OrgTeamProvider>
            </TaskProvider>
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}