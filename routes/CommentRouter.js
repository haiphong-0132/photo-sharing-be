const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
const mongoose = require("mongoose")

router.get("/", (req, res) => {

})

router.get("/:id", async (req, res) => {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(400).json({error: "Invalid user id format"});
    }

    const userComments = [];

    try {
        const photos = await Photo.find();

        for (const photo of photos){
            for (const comment of photo.comments){
                if (comment.user_id.toString() === userId){
                    userComments.push({
                        comment_id: comment._id,
                        photo_file_name: photo.file_name,
                        photo_id: photo._id,
                        comment: comment.comment,
                        date_time: comment.date_time,
                        owner_id: comment.user_id
                    })
                }
            }
        }

        res.status(200).json(userComments);

    } catch (err){
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    }
})

module.exports = router;