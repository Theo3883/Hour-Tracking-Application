'use client';

import { Suspense } from 'react';
import Sidebar from "@/components/Sidebar";
import LoadingBar from '@/components/LoadingBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-8">
        <Suspense fallback={<LoadingBar />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}