const User = require("../models/UserModel");

const register = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;

    // Use Firebase or frontend fallback data
    const name = req.user.name || req.body.name;
    const email = req.user.email || req.body.email;
    const photoURL = req.user.picture || req.body.photoURL;
    const phoneNumber = req.user.phone_number || req.body.phoneNumber;
    const location = req.body.location;

    if (!firebaseUid || !email) {
      console.warn("Missing fields:", { firebaseUid, email });
      return res.status(400).json({ message: "Missing required fields (email or firebaseUid)" });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      {
        firebaseUid,
        name,
        email,
        photoURL,
        phoneNumber,
        location,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
};


const getUser = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, getUser, login };
