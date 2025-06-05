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

dotenv.config();
const secretKey = process.env.SECRET_KEY;

dbConnect();

function verifyToken(req, res, next){
    const token = req.headers['authorization'];
    if (typeof token !== 'undefined'){
        jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
            if (err){
                res.status(403).send('Invalid token');
            }
            else{
                req.user = decoded.user;
                next();
            }
        });
    } else {
        res.status(401).send('Unauthorized');
    }
}


function verifyToken(req, res, next){
  const token = req.headers['authorization'];
  if (typeof token === 'undefined'){
    return res.status(401).send('Unauthorized');
  }
  jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
    if (err){
      res.status(403).send('Invalid token');
    }
    else{
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
app.use('/images', express.static(path.join(__dirname, 'images')));


app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});


app.listen(8081, () => {
  console.log("server listening on port 8081");
});
