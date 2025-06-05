const express = require("express");
const User = require("../db/userModel");
const jsonParser = express.json();
const jwt = require("jsonwebtoken");
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config()
const secretKey = process.env.SECRET_KEY;

router.post("/login", jsonParser, async (req, res) => {
    const creds = {
        login_name: req.body.login_name,
        password: req.body.password
    };

    try {
        
        const user = await User.findOne({login_name: creds.login_name, password: creds.password}).select('_id first_name last_name');
        if (user){
            jwt.sign({user}, secretKey, {expiresIn: "1h"}, (err, token) => {
                if (err){
                    res.status(500).send("Error generating token");

                }
                else{
                    res.status(200).json({
                        token: token, 
                        status:"Login successfully",
                        user: {
                            id: user._id,
                            first_name: user.first_name,
                            last_name: user.last_name
                        }
                    });
                }
            })
        }
        else {
            res.status(400).send({message: "Bad request"});
        }
    } catch (err){
        res.status(500).send({message: "Error logging in: ", err});
    }
})

router.post('/logout', (req, res) => {
    const token = req.headers['authorization'];
    if (!token || !token.startsWith("Bearer ")){
        return res.status(400).json({error: "User not logged in"});
    }

    return res.status(200).json({message: "Logged out successfully!"});
})


module.exports = router;