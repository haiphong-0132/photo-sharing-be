const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();



router.post("/", async (request, response) => {
  
});

router.get("/:id", async (request, response) => {
    const userId = request.params.id;
    try{
        const user = await User.findById(userId);
        if (!user){
            return response.status(400).json({error: "User not found"});
        }

        const userComments = [];

        const photos = await Photo.find();

        for (const photo of photos){
            for (const comment of photo.comments){
                if (comment.user_id.toString() === userId){
                    userComments.push({
                        comment_id: comment._id,
                        photo_file_name: photo.file_name,
                        comment: comment.comment,
                        date_time: comment.date_time,
                        owner_id: photo.user_id
                        
                    })
                }
            }
        }
        response.json(userComments);
    } catch(error){
        console.error(error);
        response.status(500).json({error: "Internal server error"});
    }
});

module.exports = router;