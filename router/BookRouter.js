const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/AuthMiddleware");
const {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controller/BookController");

// 🔹 Create a new book (Seller)
router.post("/", verifyToken, addBook);

// 🔹 Get all books (Public)
router.get("/", getAllBooks);

// 🔹 Get book by ID (Public)
router.get("/:id", getBookById);

// 🔹 Update book (Seller only)
router.put("/:id", verifyToken, updateBook);

// 🔹 Delete book (Seller only)
router.delete("/:id", verifyToken, deleteBook);

module.exports = router;
