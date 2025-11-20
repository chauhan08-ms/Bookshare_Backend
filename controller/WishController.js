const Wishlist = require("../models/Wishlist");

// ✅ Add a book to wishlist
const add = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.uid;

    const existing = await Wishlist.findOne({ user: userId, book: bookId });
    if (existing)
      return res.status(200).json({ message: "Book already in wishlist" });

    const newEntry = new Wishlist({ user: userId, book: bookId });
    await newEntry.save();

    res.status(201).json({ message: "Added to wishlist" });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Remove book from wishlist
const remove = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.uid;

    await Wishlist.findOneAndDelete({ user: userId, book: bookId });
    res.status(200).json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all books in wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.uid;

    const wishlist = await Wishlist.find({ user: userId }).populate("book");

    const books = wishlist.map((item) => item.book).filter(Boolean);

    res.status(200).json({ books });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Toggle wishlist (add/remove in one route)
const toggleWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.uid;

    const existing = await Wishlist.findOne({ user: userId, book: bookId });

    if (existing) {
      await Wishlist.findOneAndDelete({ user: userId, book: bookId });
      return res.status(200).json({ status: "removed", message: "Removed 💔" });
    } else {
      await Wishlist.create({ user: userId, book: bookId });
      return res.status(201).json({ status: "added", message: "Added 💖" });
    }
  } catch (err) {
    console.error("Toggle wishlist error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { add, remove, getWishlist, toggleWishlist };
