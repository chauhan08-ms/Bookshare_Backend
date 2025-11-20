const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();


const userRoutes = require("./router/AuthRouter");
const bookRouter = require("./router/BookRouter");
const wishlistRouter = require("./router/WishlistRoutes")
const paymentRouter = require("./router/PaymentRoute");
const purchaseRouter = require("./router/PurchaseRouter");

console.log(process.env.RAZORPAY_SECRET);



const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/books", bookRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/purchases", purchaseRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
