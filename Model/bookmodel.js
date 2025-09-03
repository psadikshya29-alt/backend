const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookschema = new Schema({
  bookName: {
    type: String,
    unique: true,
    required: true,
  },
  bookPrice: {
    type: Number,
  },
  isbnNumber: {
    type: Number,
  },
  authorName: {
    type: String,
  },
  publishedAt: {
    type: String,
  },
  publication: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
});

const Book = mongoose.model("Book", bookschema);
module.exports = Book;
