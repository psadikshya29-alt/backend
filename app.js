require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Book = require("./Model/bookmodel.js");
const fs = require("fs");

const { multer, storage } = require("./middleware/multerconfig.js");
const upload = multer({ storage: storage });
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin:
    [
      "https://app.netlify.com/projects/magenta-souffle-c12ce1/deploys/68b81e59faf6d300080111b5",
      " http://localhost:5173/"
    ]
  })
);

const PORT = process.env.PORT || 3000;
const ConnectionString = process.env.MONGO_URI;

async function connectToDatabase() {
  try {
    await mongoose.connect(ConnectionString);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
connectToDatabase();
const BASE_URL= "https://backend-2iyf.onrender.com"

app.get("/book", async (req, res) => {
  const books = await Book.find(); // return array ma garxa
  res.status(200).json({
    message: "Books fetched successfully",
    data: books,
  });
});

app.post("/book", upload.single("image"), async (req, res) => {
let fileName = req.file
        ? `${BASE_URL}/${req.file.filename}`
        : "https://cdn.vectorstock.com/i/preview-1x/77/30/default-avatar-profile-icon-grey-photo-placeholder-vector-17317730.jpg";


  console.log(req.body);
  const bookName = req.body.bookName;
  const bookPrice = req.body.bookPrice;
  const authorName = req.body.authorName;

  // const {bookName,bookPrice} = req.body;
  const book = await Book.create({
    bookName,
    bookPrice,
    authorName,
    imageUrl: filename,
  });
  res.status(200).json({ message: "Booking received....", data: book });
});
//single book
app.get("/book/:id", async (req, res) => {
  const bookId = req.params.id;

  const book = await Book.findById(bookId);

  if (!book) {
    return res.status(404).json({
      message: "Book not found",
    });
  } else {
    res.status(200).json({
      message: "Book fetched successfully",
      data: book,
    });
  }
});
// delete operation
app.delete("/book/:id", async (req, res) => {
  const id = req.params.id;
  await Book.findByIdAndDelete(id);
  res.status(200).json({
    message: "Book Deketed successfully",
  });
});

app.patch("/book/:id", upload.single('image'), async (req, res) => {
    const id = req.params.id // kun book update garney id ho yo
    const { bookName, bookPrice, authorName, publishedAt, publication, isbnNumber } = req.body
    const oldDatas = await Book.findById(id)
    if (!oldDatas) {
        return res.status(404).json({ message: "Book not found" });
    }

    let fileName = oldDatas.imageUrl;

    if (req.file) {
        // delete old file if it was not a placeholder image
        if (oldDatas.imageUrl && oldDatas.imageUrl.startsWith(BASE_URL)) {
            const oldImagePath = oldDatas.imageUrl.slice(BASE_URL.length + 1);
            fs.unlink(`storage/${oldImagePath}`, (err) => {
                if (err) console.log("Error deleting old file:", err);
                else console.log("Old file deleted successfully");
            });
        }

        // save new file path
        fileName = `${BASE_URL}/${req.file.filename}`;

    }

    await Book.findByIdAndUpdate(id, {
        bookName,
        bookPrice,
        authorName,
        publication,
        publishedAt,
        isbnNumber,
        imageUrl: fileName,   //  update image URL if changed
    });

    res.status(200).json({
        message: "Book Updated Successfully"
    });
})

app.use(express.static("./storage/"));
app.listen(PORT, () => {
  console.log(`Node.js server is running on port ${PORT}`);
});

//delete operation
app.delete("/book/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Delete image file only if it's stored locally (not placeholder or external link)
    if (book.imageUrl && book.imageUrl.startsWith(BASE_URL)) {
            const imagePath = book.imageUrl.slice(BASE_URL.length + 1);
            fs.unlink(`storage/${imagePath}`, (err) => {
                if (err) console.error("Error deleting file:", err);
                else console.log("Image file deleted successfully");
            });
        }

    // Delete book from DB
    await Book.findByIdAndDelete(id);

    res.status(200).json({
      message: "Book Deleted Successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});
