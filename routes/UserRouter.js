const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

router.post("/", async (request, response) => {
  
});

router.get("/list", async (request, response) => {
    try {
        const users = await User.find().select('_id first_name last_name');
        response.json(users);
    } catch(error){
        console.error(error);
        response.status(500).json({erorr: "Internal server error"});
    }
});

router.get("/:id", async (request, response) => {
    const userId = request.params.id;
    try{
        const user = await User.findById(userId);
        if (!user){
            return response.status(400).json({error: "User not found"});
        }
        response.json(user);
    } catch(error){
        console.error(error);
        response.status(500).json({error: "Internal server error"});
    }
});

module.exports = router;