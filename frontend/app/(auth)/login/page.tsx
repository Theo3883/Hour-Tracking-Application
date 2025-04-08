"use client";

import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { Department } from "@/context/DepartmentContext";
import { fetchDepartments } from "../../../utils/api";

const fetchUserDepartmentName = async (departmentId: string) => {
  try {
    const departments = await fetchDepartments();
    const userDepartment = departments.find(
      (department: Department) => department._id === departmentId
    );
    if (userDepartment) {
      return userDepartment.name;
    }
    return "";
  } catch (error) {
    console.error("Error fetching department name:", error);
    return "";
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "authenticated") {
      const fetchData = async () => {
        const departmentName = await fetchUserDepartmentName(
          session?.user?.departmentID as string
        );
        console.log("User department name:", departmentName);
        router.push(`/home?userDepartmentName=${departmentName}`);
      };
      fetchData();
    }
  }, [status, router, session]);

  return (
    <div className="flex h-screen w-full relative">
      {/* Logo positioned absolutely at the top left corner of the entire page */}
      <div className="absolute top-8 left-8 z-10">
        <Image
          src="/icons/logo-asii-dark.png"
          alt="ASII Logo"
          width={100}
          height={100}
          className="object-contain"
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Left half - White background with login form */}
      <div className="login-side bg-white p-8">
        {/* Login content - vertically centered */}
        <div className="flex flex-col justify-center items-center mt-16">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-gray-500 mb-10">
              Please sign in to access the hour tracking application
            </p>
            <Button
              onClick={() => signIn("google", { callbackUrl: "/home" })}
              variant="outline"
              className="w-full py-6 flex items-center justify-center gap-3 rounded-xl border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Image
                src="/icons/google-logo.svg"
                alt="Google"
                width={24}
                height={24}
              />
              <span className="font-medium">Sign in with Google</span>
            </Button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Only <span className="text-blue-500">@asii.ro</span> emails are
              allowed
            </p>
          </div>
        </div>
      </div>

      {/* Right half - Blue background with image */}
      <div className="login-side bg-gradient-to-r from-[#0a1026] to-gray-900 text-white">
        <h2 className="text-3xl font-bold">
          Welcome to <span className="text-blue-400">ASII Members</span>
        </h2>
        <p className="mt-2 text-white-400 font-bold">Manage. Connect. Grow.</p>
        <Image
          src="/icons/auth-image.png"
          alt="Mascot"
          width={900}
          height={800}
          className="mt-6"
        />
      </div>
    </div>
  );
}
