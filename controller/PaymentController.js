const Razorpay = require("razorpay");
const Order = require("../models/OrderModel");
const Purchase = require("../models/PurchaseModel");

// 🔑 Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// 🧾 Step 1: Create Order
exports.createOrder = async (req, res) => {
  try {
    const { amount, bookId } = req.body;
    const user = req.user.uid; // From Firebase middleware

    console.log({ amount, bookId, user });

    if (!amount || !bookId)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const options = {
      amount: amount * 100, // Razorpay takes paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // ✅ Save order in DB
    await Order.create({
      orderId: order.id,
      amount,
      currency: order.currency,
      book: bookId,
      user,
      status: "created",
    });

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.warn("Razorpay order error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Step 2: Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookId } =
      req.body;
    const user = req.user.uid;

    if (!razorpay_order_id || !razorpay_payment_id)
      return res.status(400).json({ success: false, message: "Invalid payment data" });

    // 🧾 Update order as paid
    await Order.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { status: "paid", razorpayPaymentId: razorpay_payment_id }
    );

    // 💾 Save to purchase history
    await Purchase.create({
      buyer: user,
      book: bookId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: req.body.amount / 100,
      status: "Completed",
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Payment verification failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
