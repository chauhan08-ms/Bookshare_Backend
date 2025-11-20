const express = require("express");
const router = express.Router();
const { getUserPurchases } = require("../controller/PurchaseController");
const { verifyToken } = require("../middleware/AuthMiddleware");
const { generateInvoice } = require("../controller/GenerateInvoice");

// ✅ Protected route
router.get("/my", verifyToken, getUserPurchases);
router.get("/invoice/:id", verifyToken, generateInvoice);


module.exports = router;