import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb"; // তোমার ডাটাবেস কানেকশন ফাইল

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password, role } = await req.json();

    // চেক করা ইউজার আগে থেকে আছে কি না
    const existingUser = await User.findOne({ email });
    if (existingUser) return NextResponse.json({ error: "User already exists" }, { status: 400 });

    // নতুন ইউজার তৈরি
    const newUser = await User.create({ name, email, password, role });
    return NextResponse.json({ message: "User created successfully", user: newUser });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}