const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    receipt: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    user: { type: String, required: true }, // Firebase UID (string)
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
