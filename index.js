const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");
const LoginRegisterRouter = require("./routes/LoginRegisterRouter");
const path = require("path");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { text } = require("stream/consumers");
const User = require("./db/userModel");
const multer = require("multer");
const Photo = require("./db/photoModel");

dotenv.config();
const secretKey = process.env.SECRET_KEY;

dbConnect();

function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (typeof token !== "undefined") {
    jwt.verify(token.split(" ")[1], secretKey, (err, decoded) => {
      if (err) {
        res.status(403).send("Invalid token");
      } else {
        req.user = decoded.user;
        next();
      }
    });
  } else {
    res.status(401).send("Unauthorized");
  }
}

function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (typeof token === "undefined") {
    return res.status(401).send("Unauthorized");
  }
  jwt.verify(token.split(" ")[1], secretKey, (err, decoded) => {
    if (err) {
      res.status(403).send("Invalid token");
    } else {
      req.user = decoded.user;
      next();
    }
  });
}

app.use(cors());
app.use(express.json());
app.use("/api/user", verifyToken, UserRouter);
app.use("/api/photo", verifyToken, PhotoRouter);
app.use("/api/comment", verifyToken, CommentRouter);
app.use("/admin", LoginRegisterRouter);
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.post("/user", async (req, res) => {
  try {
    const { login_name, password, first_name, last_name } = req.body;
    const location = req.body?.location || "";
    const description = req.body?.description || "";
    const occupation = req.body?.occupation || "";

    const existUser = await User.findOne({ login_name: login_name });
    if (existUser) {
      return res.status(409).json({
        message: "User already exists with this login name",
      });
    }

    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("Registration error: ", err);
    res.status(500).json({
      message: "Error registering user",
      error: err.message,
    });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

app.post(
  "/photos/new",
  verifyToken,
  upload.array("images", 10),
  async (req, res) => {
    const user = req.user;
    const savedPhotos = [];

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    try {
      for (const file of req.files) {
        const filename = file.filename;

        const newPhoto = new Photo({
          file_name: filename,
          date_time: new Date(),
          user_id: user._id,
          comments: [],
        });

        await newPhoto.save();
        savedPhotos.push({
          id: newPhoto._id,
          imageUrl: `/images/${filename}`,
        });
      }
      res.status(201).json({
        message: `Successfully uploaded ${savedPhotos.length} photos`,
        photos: savedPhotos,
      });
    } catch (err) {
      console.error("Error saving photo: ", err);
      res.status(500).json({ message: "Failed to save photo" });
    }
  }
);

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
