import express from "express";
import Message from "../models/Message.js";
import {protect} from "../middleware/auth.js";

const router = express.Router();

router.get("/:room", protect, async (req, res) => {
    try{
        const {room}= req.params;
        const {page=1, limit=50}= req.query;

        const messages= await Message.find({room})
                                    .populate("sender", "name email")
                                    .sort({createdAt: -1})
                                    .skip((page-1)*limit)
                                    .limit(parseInt(limit));
        
        const total= await Message.countDocuments({room});

        res.status(200).json({
            messages: messages.reverse(),
            currentPage: parseInt(page),
            totalPages: Math.ceil(total/limit),
            totalMessages: total,
        });
    }
    catch(error){
        res.status(500).json({message: "Server error.", error: error.message});
    }
});

router.post("/:room", protect, async (req, res) => {
    try{
        const {room}= req.params;
        const {text}= req.body;

        if(!text){
            return res.status(400).json({message: "Message can not be empty."});
        }

        const message= await Message.create({
            sender: req.user._id,
            room,
            text: text.trim(),
        });

        const populated =await message.populate("sender", "name role");
        res.status(201).json(populated);
    }
    catch(error){
        res.status(500).json({message: "Server error.", error: error.message});
    }
});

router.patch("/:id", protect, async(req,res)=> {
    try {
        const {room}= req.body;

        await Message.updateMany(
            {room, readBy: {$nin: req.user._id}},
            {$push: {readBy: req.user._id}}
        );

        res.status(200).json({message: "Messages marked as read."});
    } 
    catch (error) {
        res.status(500).json({message: "Server error.", error: error.message});
    }
});

export default router;

