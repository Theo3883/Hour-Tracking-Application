import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import fetch from 'node-fetch';


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role || "user";
        token.departmentID = user.departmentID || undefined;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role || "user";
      session.user.departmentID = token.departmentID;

      return session;
    },
    async signIn({ user }) {
      if (!user?.email) {
        console.error("Sign in failed: No email provided");
        return false;
      }

      try {
        const apiUrl = process.env.API_URL || 'http://localhost:5000';
   
        const response = await fetch(`${apiUrl}/users/googleLogin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name || "",
          })
        });

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const responseText = await response.text();
          console.error("Non-JSON response from API:", responseText);
          console.error("Status code:", response.status);
          return false;
        }

        if (response.ok && data?.user) {
          // User exists or was created, add data to user object
          user.role = data.user.role || "user";
          user.departmentID = data.user.departmentID;
          user.id = data.user.id || data.user._id;
          return true;
        }

        console.error("API error:", data?.message || "Unknown error");
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};
