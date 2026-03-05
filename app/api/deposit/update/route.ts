import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Deposit from "@/models/Deposit";
import User from "@/models/User";

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { id, status } = await req.json();

    const deposit = await Deposit.findById(id);
    if (!deposit) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (deposit.status !== "Pending") return NextResponse.json({ error: "Already processed" }, { status: 400 });

    if (status === "Approved") {
      // ইউজারের ইমেইল দিয়ে সার্চ (ছোট/বড় হাতের অক্ষর সমস্যা হবে না)
      const userUpdate = await User.findOneAndUpdate(
        { email: { $regex: new RegExp(`^${deposit.userEmail.trim()}$`, "i") } },
        { $inc: { balance: Number(deposit.credits) } },
        { new: true }
      );

      if (!userUpdate) {
        return NextResponse.json({ 
          error: `User (${deposit.userEmail}) not found in database. Please register first!` 
        }, { status: 404 });
      }
    }

    deposit.status = status;
    await deposit.save();

    return NextResponse.json({ success: true, message: `Deposit ${status}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}