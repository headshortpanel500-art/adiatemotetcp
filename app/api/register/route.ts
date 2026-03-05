import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    // ১. চেক করো এই ইমেইল দিয়ে আগে অ্যাকাউন্ট খোলা হয়েছে কি না
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email!" },
        { status: 400 }
      );
    }

    // ২. নতুন ইউজার তৈরি করা (সরাসরি পাসওয়ার্ড সেভ হচ্ছে)
    const newUser = new User({
      name,
      email,
      password, // bcrypt ছাড়া সরাসরি পাসওয়ার্ড
      isBanned: false,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}