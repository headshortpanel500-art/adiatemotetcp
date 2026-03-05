import { loginAndCollectCookies } from "@/lib/b25-cookie";
import { loadEmotes } from "@/lib/loadEmotes";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import dbConnect from "@/lib/mongodb"; 
import User from "@/models/User"; 

export async function GET(request: Request) {
  const url = new URL(request.url);
  const offset = Number(url.searchParams.get("offset"));
  const limit = Number(url.searchParams.get("limit"));

  try {
    // ১. সেশন চেক
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ২. ডাটাবেজ থেকে ইউজারের ব্যালেন্স এবং স্ট্যাটাস চেক
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.isBanned) {
      return NextResponse.json(
        { error: "You are banned from using this bot!" },
        { status: 403 }
      );
    }

    // ৩. ইমোট লোড করার লজিক
    const cookies = await loginAndCollectCookies();
    if (cookies.length === 0) {
      return NextResponse.json(
        { error: "No cookies collected" },
        { status: 401 },
      );
    }

    const data = await loadEmotes({
      offset: offset,
      limit: limit,
      cookies: cookies,
    });

    // ৪. ইমোট ডাটার সাথে ডাটাবেজের 'balance' পাঠিয়ে দেওয়া
    return NextResponse.json({
      ...data,
      credits: dbUser.balance || 0 // ডাটাবেজের balance ফিল্ড এখানে credits নামে ফ্রন্টএন্ডে যাবে
    });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to load emotes" },
      { status: 500 },
    );
  }
}