const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
const jsonParser = express.json();

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

router.patch("/commentsOfPhoto/:photo_id", jsonParser, async(req, res) => {
    const editedComment = req.body.comment;
    const commentId = req.body.comment_id;
    const photoId = req.params.photo_id;
    const currentUser = req.user;
    try {
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return res.status(404).json({error: "Photo not found"});
        }
        const commentToEdit = photo.comments.id(commentId);

        if (!commentToEdit){
            return res.status(404).json({error: "Comment not found"});
        }

        if (commentToEdit.user_id.toString() !== currentUser._id.toString()){
            return res.status(403).json({error:"Authorization"});
        }

        commentToEdit.comment = editedComment;
        commentToEdit.date_time = new Date();
        await photo.save();

        const userDetails = await User.findById(currentUser._id).select('_id first_name last_name');
        
        res.status(200).json({
            message: "Comment updated successfully",
            comment: {
                comment_id: commentToEdit._id,
                comment: commentToEdit.comment,
                date_time: commentToEdit.date_time,
                user: userDetails
            }
        });



    } catch (err){
        console.error("Internal server error: ", err);
        res.status(500).json({error: err});
    }
})

router.post("/commentsOfPhoto/:photo_id", jsonParser, async (req, res) => {
    const photoId = req.params.photo_id;

    if (!mongoose.Types.ObjectId.isValid(photoId)){
        return res.status(400).json({error: "Photo Id is not valid"});
    }

    const comment = req.body?.comment;
    const userId = req.user._id;

    if (!comment || (comment && comment.trim() === '')){
        return res.status(400).json({error: "Comment can't empty"});
    }

    try {
        const newComment = {
            comment: comment,
            user_id: userId,
            date_time: new Date()
        };

        const updatedPhoto = await Photo.findByIdAndUpdate(
            photoId,
            {$push: {comments: newComment}},
            {new: true}
        );

        if (!updatedPhoto){
            return res.status(404).json({error: "Photo not found"});
        }

        const addedComment = updatedPhoto.comments[updatedPhoto.comments.length - 1];

        const user = await User.findById(addedComment.user_id).select('_id first_name last_name');

        if (!user) {
            return res.status(500).json({error: "Failed to retrieve user data"});
        }

        res.status(201).json({
            message: "Comment added successfully!",
            comment: {
                comment_id: addedComment._id,
                comment: addedComment.comment,
                date_time: addedComment.date_time,
                user: user
            }
        });
    } catch(err){
        console.error("Error adding comment: ", err);
        return res.status(500).json({error: "Failed to add comment"});
    }

})

module.exports = router;