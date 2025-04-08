import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: string;
      departmentID?: string;
      firstName?: string;
      lastName?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
    departmentID?: string;
    firstName?: string;
    lastName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    departmentID?: string;
    firstName?: string;
    lastName?: string;
  }
}