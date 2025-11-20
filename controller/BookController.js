const Book = require("../models/BookModel");

// ✅ Add Book
exports.addBook = async (req, res) => {
  try {
    const { title, author, price, description, category, image, location, pages, condition } = req.body;
    console.log(req.body);
    

    // Extract coordinates safely
    const coordinates = location?.coordinates;

    if (!title || !author || !price || !coordinates) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newBook = new Book({
      title,
      author,
      price,
      description,
      category,
      imageUrl: image, // ✅ map `image` from frontend to `imageUrl` in DB
      pages,
      condition,
      location: { type: "Point", coordinates },
      seller: {
        uid: req.user.uid,
        name: req.user.name || "Unknown Seller",
        email: req.user.email,
      },
    });

    await newBook.save();
    res.status(201).json({ message: "Book added successfully", book: newBook });
  } catch (err) {
    console.error("Add Book Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get All Books (with optional filters)
// ✅ Add pagination (optional)
exports.getAllBooks = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, near, lat, lng, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (minPrice || maxPrice)
      filter.price = { ...(minPrice && { $gte: minPrice }), ...(maxPrice && { $lte: maxPrice }) };

    let query = Book.find(filter);

    if (near && lat && lng) {
      query = query.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(near) * 1000,
          },
        },
      });
    }

    const books = await query.skip((page - 1) * limit).limit(parseInt(limit)).exec();
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Single Book
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (err) {
    console.error("Get Book Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Book (Only Seller)
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.seller.uid !== req.user.uid)
      return res.status(403).json({ message: "Unauthorized to update this book" });

    Object.assign(book, req.body);
    await book.save();

    res.status(200).json({ message: "Book updated successfully", book });
  } catch (err) {
    console.error("Update Book Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete Book (Only Seller)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.seller.uid !== req.user.uid)
      return res.status(403).json({ message: "Unauthorized to delete this book" });

    await book.deleteOne();
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("Delete Book Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
