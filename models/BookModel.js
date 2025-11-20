const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String },
    imageUrl: { type: String },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true, // [longitude, latitude]
      },
    },

    seller: {
      uid: { type: String, required: true },
      name: { type: String },
      email: { type: String },
    },
       isSold: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookSchema.index({ location: "2dsphere" }); // For geo queries

module.exports = mongoose.model("Book", bookSchema);
