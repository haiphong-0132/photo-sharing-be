const express = require("express");
const User = require("../db/userModel");
const router = express.Router();
const mongoose = require("mongoose");

router.post("/", async (request, response) => {
  
});

router.get("/", async (request, response) => {
  
});

router.get("/list", async (req, res) => {
    try{
        const users = await User.find().select("_id first_name last_name");
        res.status(200).json(users);
    }
    catch (err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
    }
})

router.get("/:id", async (req, res) => {
    try{
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({error: 'Invalid user id format'});
        }

        const user = await User.findById(userId);
        res.status(200).json(user);
    } catch (err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
    }
})

module.exports = router;