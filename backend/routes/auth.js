import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router= express.Router();

const generateToken = (id)=> {
    return jwt.sign(
        {id}, 
        process.env.JWT_SECRET, 
        {expiresIn: "7d"}
    );
};

router.post("/register", async(req,res) => {
    const {name,email,password,role}= req.body;
    try{
        if(!name || !email || !password || !role){
            return res.status(400).json({message: "Please fill in all fields."});
        }
        if (password.length <10){
            return res
            .status(400)
            .json( {
                message: "Password must be at least 10 characters long.",
            });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
            message: "Password must include uppercase, lowercase, number, and special character.",
        });
}
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exists."});
        }
        const user= await User.create({name,email,password,role});

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    }
    catch(error){
        res.status(500).json({message: "Server error.", error: error.message});
    }
});

router.post("/login", async(req,res)=>{
    const {email,password}= req.body;
    try{
        if(!email || !password){
            return res
            .status(400)
            .json({message: "Please fill in all fields."});
        }
        const user= await User.findOne({email}).select('+password');
        if(!user){
            return res.status(401).json({message: "Invalid email or password."});
        }
        const isMatch= await user.matchPassword(password);
        if(!isMatch){
            return res.status(401).json({message: "Invalid email or password."});
        }
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    }
    catch(error){
        res.status(500).json({message: "Server error.", error: error.message});
    }
});

router.get("/me", async(req,res) => {
    try{
        const token = req.headers.authorization?.split(" ")[1];
        if(!token){
            return res.status(401).json({message: "No token, authorization denied."});
        }
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        const user= await User.findById(decoded.id).select("-password");
        res.status(200).json(user);
    }
    catch(error){
        res.status(401).json({message: "Token is not valid.", error: error.message});
    }
});

export default router;