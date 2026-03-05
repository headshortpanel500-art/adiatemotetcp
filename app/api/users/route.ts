import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// ১. সব ইউজার ডাটাবেজ থেকে নিয়ে আসা
export async function GET() {
  try {
    await dbConnect();
    // পাসওয়ার্ড বাদে বাকি সব ডাটা নিয়ে আসা ভালো (নিরাপত্তার জন্য)
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// ২. ইউজারের ব্যালেন্স, রোল বা ব্যান স্ট্যাটাস আপডেট করা
export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { id, ...updatedData } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // updatedData এর ভেতর balance, isBanned, role যাই থাকুক তা আপডেট হবে
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { $set: updatedData }, 
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}

// ৩. ইউজার ডিলিট করা
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}