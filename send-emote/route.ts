import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import dbConnect from "@/lib/mongodb"; 
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    // ১. সেশন চেক
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // ২. ডাটাবেজ কানেক্ট
    await dbConnect();

    // ৩. ব্যালেন্স কমানো এবং লেটেস্ট ইউজার ডাটা একবারে পাওয়া (findOneAndUpdate ব্যবহার করা ভালো)
    // এটি ব্যালেন্স ১ এর বেশি থাকলে তবেই কমাবে এবং আপডেট করা নতুন ডাটা রিটার্ন করবে
    const updatedUser = await User.findOneAndUpdate(
      { 
        email: session.user.email, 
        balance: { $gt: 0 } // ব্যালেন্স অবশ্যই ০ থেকে বেশি হতে হবে
      },
      { $inc: { balance: -1 } }, 
      { new: true } // এটি আপডেট হওয়া নতুন ব্যালেন্সসহ অবজেক্ট রিটার্ন করবে
    );

    // ৪. যদি আপডেট না হয় তার মানে ব্যালেন্স নেই বা ইউজার নেই
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Insufficient balance or User not found!" },
        { status: 402 } 
      );
    }

    // ৫. এখানে তোমার ইমোট পাঠানোর আসল গেম লজিক বসাও
    // উদাহরণ: const gameRes = await sendToGame(body);

    // ৬. সফল রেসপন্স পাঠানো
    return NextResponse.json({ 
      success: true, 
      message: "Emote sent successfully!",
      // এখানে সরাসরি আপডেট হওয়া নতুন ব্যালেন্সটাই ফ্রন্টএন্ডে যাবে
      remainingBalance: updatedUser.balance 
    });

  } catch (error) {
    console.error("Backend Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}