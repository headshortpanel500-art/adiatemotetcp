import mongoose, { Schema, model, models } from "mongoose";

const DepositSchema = new Schema({
  senderNumber: { type: String, required: true },
  transactionId: { type: String, required: true, unique: true },
  credits: { type: Number, required: true },
  price: { type: Number, required: true },
  gateway: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export default models.Deposit || model("Deposit", DepositSchema);