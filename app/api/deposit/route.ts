import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Deposit from "@/models/Deposit";
import { getCurrentUser } from "@/lib/currentUser";

// নতুন ডিপোজিট রিকোয়েস্ট সেভ করা
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const user = await getCurrentUser()
    const newDeposit = await Deposit.create({
     ...body,
      userEmail:user?.email,
      userName:user?.name
    });
    return NextResponse.json({ success: true, data: newDeposit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    await dbConnect();
  const user = await getCurrentUser()
  const email=user?.email
    // যদি ইমেইল থাকে তবে শুধু ঐ ইউজারের ডাটা, নাহলে সব (অ্যাডমিনের জন্য)
    const query = email ? { userEmail: email } : {};
    const deposits = await Deposit.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(deposits);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}