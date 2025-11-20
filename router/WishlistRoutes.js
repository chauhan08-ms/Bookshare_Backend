const express = require("express");
const router = express.Router();
const {
  add,
  remove,
  getWishlist,
  toggleWishlist,
} = require("../controller/WishController");
const { verifyToken } = require("../middleware/AuthMiddleware");

// All routes require Firebase token
router.post("/add", verifyToken, add);
router.delete("/remove/:bookId", verifyToken, remove);
router.get("/", verifyToken, getWishlist);
router.post("/toggle", verifyToken, toggleWishlist);

module.exports = router;
