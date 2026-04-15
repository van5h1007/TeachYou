import mongoose from "mongoose";

const messageSchema= new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        room: {
            type: String,
            required: true,
            trim: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: [1000, "Message cannot exceed 1000 characters."],

        },
        readBy: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },
    },
    {timestamps: true}
);

messageSchema.index(
    {
        room: 1,
        createdAt: -1,
    }
);

const Message= mongoose.model("Message", messageSchema);
export default Message;