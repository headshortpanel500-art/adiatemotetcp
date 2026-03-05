import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { email, isBanned } = await req.json(); // আমরা ইমেইল দিয়ে ব্যান করছি

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { username: email.split("@")[0], isBanned: isBanned },
      { new: true }
    );

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: `User ${isBanned ? 'Banned' : 'Unbanned'}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}