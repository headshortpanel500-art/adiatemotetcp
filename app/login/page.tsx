import { getServerSession } from "next-auth"; // সেশন চেক করার জন্য
import { redirect } from "next/navigation"; // রিডাইরেক্ট করার জন্য
import HomePage from "@/components/Home";
import LoginPage from "@/components/login";

export default async function Home() {
  // ১. ইউজারের লগইন সেশন চেক করা
  const session = await getServerSession();

  // ২. যদি সেশন না থাকে (মানে ইউজার লগইন করেনি)

  // ৩. যদি লগইন করা থাকে, তবেই HomePage দেখাবে
  // প্রয়োজনে ইউজারের ডাটা (session.user) প্রোড হিসেবে পাঠানো যায়
  return (
    <LoginPage />
  );
}