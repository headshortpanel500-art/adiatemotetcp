import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const getCurrentUser = async () => {
  try {
    const session = await getServerSession(authOptions);

    // ১. যদি সেশনে ইউজার না থাকে
    if (!session?.user?.email) {
      return null;
    }

    await dbConnect();

    // ২. সরাসরি ডাটাবেজ থেকে ইউজারকে খুঁজে বের করা
    // এতে ইউজারের লেটেস্ট ব্যালেন্স এবং ব্যান স্ট্যাটাসও পাওয়া যাবে
    const dbUser = await User.findOne({ 
      email: session.user.email 
    }).select("-password"); // পাসওয়ার্ড ছাড়া সব ডাটা নিবে

    // ৩. যদি ইউজার ডাটাবেজে না থাকে বা ব্যান থাকে, তবে তাকে 'null' ফেরত দিবে
    if (!dbUser || dbUser.isBanned) {
      return null;
    }

    return dbUser; // এখানে email, balance, isBanned সব থাকবে
  } catch (error) {
    console.error("GetCurrentUser Error:", error);
    return null;
  }
};