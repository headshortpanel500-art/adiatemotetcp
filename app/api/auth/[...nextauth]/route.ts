import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextAuthOptions } from "next-auth";

// ১. আগে authOptions ভেরিয়েবল তৈরি করো যাতে অন্য ফাইল ইমপোর্ট করতে পারে
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        
        const user = await User.findOne({ email: credentials?.email });

        // পাসওয়ার্ড চেক
        if (user && user.password === credentials?.password) {
          
          // ব্যান চেক
          if (user.isBanned) {
            throw new Error("BANNED"); 
          }

          return { 
            id: user._id.toString(), 
            name: user.name, 
            email: user.email,
            isBanned: user.isBanned 
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      await dbConnect();
      const dbUser = await User.findOne({ email: session.user?.email });
      
      // ইউজার ব্যানড হলে সেশন বাতিল
      if (dbUser?.isBanned) {
        return null as any; 
      }
      
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.isBanned = (user as any).isBanned;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login', 
  },
  session: {
    strategy: "jwt",
  },
};

// ২. হ্যান্ডলার তৈরি করো
const handler = NextAuth(authOptions);

// ৩. GET এবং POST এক্সপোর্ট করো
export { handler as GET, handler as POST };