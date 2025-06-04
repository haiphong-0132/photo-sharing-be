const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();

router.post("/", async (request, response) => {
  
});

router.get("/list", async (request, response) => {
  try {
    const photos = await Photo.find().select('_id file_name date_time user_id');
    response.json(photos);
  } catch(error){
    console.error(error);
    response.status(500).json({error: "Internal server error"});
  }
});

router.get("/photosOfUser/:id", async (request, response) => {
  const userId = request.params.id;
  try{
    const user = await User.findById(userId);
    if (!user){
        return response.status(400).json({error: "User not found"});
    }

    const photos = await Photo.find({user_id: userId}).select('_id user_id comments file_name date_time');
    
    const populatedPhotos = [];

    for (const photo of photos){
        const populatedComments = [];
        for (const comment of photo.comments){
            const commentUser = await User.findById(comment.user_id).select('_id first_name last_name');
            populatedComments.push({
                _id: comment._id,
                comment: comment.comment,
                date_time: comment.date_time,
                user: commentUser,
            });
        }
        populatedPhotos.push({
            _id: photo._id,
            user_id: userId,
            comments: populatedComments,
            file_name: photo.file_name,
            date_time: photo.date_time,
        });
    }
    response.json(populatedPhotos);
  } catch(error){
    console.error(error);
    response.status(500).json({error: "Internal server error"});
  }
});

module.exports = router;