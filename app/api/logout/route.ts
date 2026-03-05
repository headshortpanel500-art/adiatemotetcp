import { NextResponse } from "next/server";

export async function GET() {
  // সেশন কুকি ডিলিট করার জন্য একটি রেসপন্স তৈরি
  const response = NextResponse.json(
    { message: "Logout successful" },
    { status: 200 }
  );

  // NextAuth এর সেশন কুকিগুলো মুছে ফেলা (development এবং production দুইটার জন্যই)
  response.cookies.set("next-auth.session-token", "", { expires: new Date(0) });
  response.cookies.set("__Secure-next-auth.session-token", "", { expires: new Date(0) });

  return response;
}