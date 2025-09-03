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
    origin: "http://localhost:5173",
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

app.get("/book", async (req, res) => {
  const books = await Book.find(); // return array ma garxa
  res.status(200).json({
    message: "Books fetched successfully",
    data: books,
  });
});

app.post("/book", upload.single("image"), async (req, res) => {
  let filename;
  if (!req.file) {
    filename = "storage/hello-Screenshot 2025-06-02 140831.png";
  } else {
    filename = "http://localhost:3000/" + req.file.filename;
  }
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

app.patch("/book/:id", upload.single("image"), async (req, res) => {
  const id = req.params.id;
  const {
    bookName,
    bookPrice,
    authorName,
    publishedAt,
    publication,
    isbnNumber,
  } = req.body;
  const oldDatas = await Book.findById(id);
  let filename;
  if (req.file) {
    console.log(req.file);
    console.log(oldDatas);
    const oldImagePath = oldDatas.imageUrl;
    console.log(oldImagePath);
    const localhostUrlLength = "http://localhost:3000".length;
    const newOldImagePath = oldImagePath.slice(localhostUrlLength);
    console.log(newOldImagePath);
    fs.unlink(`storage/${newOldImagePath}`, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("file delete sucessfully");
      }
    });
    fileName = "http://localhost:3000/" + req.file.filename;
  }
  await Book.findByIdAndUpdate(id, {
    bookName: bookName,
    bookPrice: bookPrice,
    authorName: authorName,
    publishedAt: publishedAt,
    publication: publication,
    isbnNumber: isbnNumber,
  });

  res.status(200).json({
    message: "Book Updated successfully",
  });
});
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
    if (book.imageUrl && book.imageUrl.startsWith("http://localhost:3000/")) {
      const localHostUrlLength = "http://localhost:3000/".length;
      const imagePath = book.imageUrl.slice(localHostUrlLength);

      fs.unlink(`storage/${imagePath}`, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("Image file deleted successfully");
        }
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
