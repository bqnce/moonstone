import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/database/connection";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const mongooseInstance = await connectToDatabase();
          const db = mongooseInstance.connection.db;

          if (!db) {
            throw new Error("Database connection failed");
          }

          const usersCollection = db.collection("users");

          const user = await usersCollection.findOne({
            username: credentials.username,
          });

          if (!user) {
            return null;
          }

          // Simple password comparison (plain text as per requirements)
          const isPasswordValid = user.password === credentials.password;

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.username,
            email: user.email || null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };