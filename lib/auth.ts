import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google"; // যদি গুগল লগইন থাকে
// তোমার অন্য কোনো প্রোভাইডার থাকলে সেগুলো এখানে ইমপোর্ট করো

export const authOptions: NextAuthOptions = {
  providers: [
    // যদি তুমি গুগল প্রোভাইডার ব্যবহার করো
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // তোমার যদি নিজের কোনো CredentialsProvider থাকে তবে সেটা এখানে দাও
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
  },
};