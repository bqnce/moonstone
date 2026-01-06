import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/database/connection";
import { User } from "@/lib/database/models/user"; // Fontos: a User model importálása
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" }, // Username helyett már Emailt kérünk
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validáció
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          await connectToDatabase();

          // 2. Felhasználó keresése Email alapján
          // A .select("+password") kell, mert a User sémában a jelszó "select: false"
          const user = await User.findOne({ email: credentials.email }).select("+password");

          if (!user || !user.password) {
            throw new Error("Invalid credentials");
          }

          // 3. Jelszó összehasonlítás (Hash vs Plaintext)
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          // 4. Sikeres belépés -> Visszaadjuk a user objektumot
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
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
    signIn: "/login", // Ha nincs bejelentkezve, ide dobjon
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
          id: token.id as string, // Hozzáadjuk az ID-t a sessionhöz
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