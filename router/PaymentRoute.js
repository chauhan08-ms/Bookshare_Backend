const express = require("express");
const { createOrder, verifyPayment } = require("../controller/PaymentController");
const { verifyToken } = require("../middleware/AuthMiddleware.js");

const router = express.Router();

router.post("/create-order", verifyToken, createOrder);
router.post("/verify-payment", verifyToken, verifyPayment);

module.exports = router;
