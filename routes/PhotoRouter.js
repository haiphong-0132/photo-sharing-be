const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
const mongoose = require("mongoose")


router.post("/", async (request, response) => {
  
});

router.get("/list", async (request, response) => {
  try {
    const photos = await Photo.find();
    response.status(200).json(photos);
  } catch (err){
    console.error(err);
    response.status(500).json({error: "Internal server error"});
  }
});

router.get("/photosOfUser/:id", async (req, res) => {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(400).json({error: "Invalid User Id format"});
    }
    try {
        const photos = await Photo.find({user_id: userId});

        const newPhotos = [];

        for (const photo of photos){
          const comments = [];
          for (const comment of photo.comments){
            const user = await User.findById(comment.user_id).select("_id first_name last_name");
            comments.push({
              _id: comment._id,
              comment: comment.comment,
              date_time: comment.date_time,
              user: user,
            });
          }

          newPhotos.push({
            _id: photo._id,
            user_id: userId,
            comments: comments,
            file_name: photo.file_name,
            date_time: photo.date_time
          });
        }
        res.json(newPhotos);
    } catch (err){
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    }
})

module.exports = router;
