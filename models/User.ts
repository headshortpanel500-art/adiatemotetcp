import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // ব্যালেন্সের জন্য ডিফল্ট ভ্যালু ০ থাকা বাধ্যতামূলক
  balance: { type: Number, default: 0 }, 
  role: { type: String, default: "user" },
  // ব্যান সিস্টেমের জন্য এই ফিল্ডটি যোগ করা হয়েছে
  isBanned: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now },
});

// মডলেটি আগে থাকলে সেটি ব্যবহার করবে, নাহলে নতুন বানাবে
export default models.User || model("User", UserSchema);