import { loginAndCollectCookies } from "@/lib/b25-cookie";
import { sendEmote } from "@/lib/emote";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import dbConnect from "@/lib/mongodb"; 
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    // ১. সেশন চেক করা (কে রিকোয়েস্ট পাঠাচ্ছে)
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { server, team_code, emote_id, uids, auto_leave } = body;

    if (!server || !team_code || !emote_id || !uids) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // ২. ডাটাবেজ কানেক্ট এবং ব্যালেন্স চেক + কমানো (একবারে)
    await dbConnect();

    // balance ১ এর বেশি থাকলে তবেই ১ কমবে
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email, balance: { $gt: 0 } },
      { $inc: { balance: -1 } },
      { new: true } // আপডেট হওয়ার পরের ডাটা দিবে
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Insufficient balance! Please recharge." },
        { status: 402 } 
      );
    }

    // ৩. এখন ইমোট পাঠানোর আসল কাজ শুরু (গেমে পাঠানো)
    const cookies = await loginAndCollectCookies();
    if (cookies.length === 0) {
      // যদি কুকি না পাওয়া যায়, তবে ইউজারের ব্যালেন্স রিফান্ড করে দেওয়া উচিত (অপশনাল)
      await User.updateOne({ email: session.user.email }, { $inc: { balance: 1 } });
      return NextResponse.json({ error: "Failed to collect cookies" }, { status: 401 });
    }

    const gameData = await sendEmote({
      server,
      team_code,
      emote_id,
      uids,
      auto_leave: !!auto_leave,
      cookies,
    });

    // ৪. সফল রেসপন্স পাঠানো (নতুন ব্যালেন্সসহ)
    return NextResponse.json({ 
      success: true, 
      data: gameData,
      remainingBalance: updatedUser.balance // এইটা ফ্রন্টএন্ডে সেট হবে
    });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong in backend" },
      { status: 500 },
    );
  }
}