const Purchase = require("../models/PurchaseModel");

// 🧾 Get all purchases for logged-in user
exports.getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.uid;

    const purchases = await Purchase.find({ buyer: userId })
      .populate("book")
      .sort({ createdAt: -1 });

    res.json({ success: true, purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ success: false, message: "Failed to fetch purchases" });
  }
};
