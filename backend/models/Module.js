import mongoose, { Types } from "mongoose";

const moduleSchema= new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required."],
            trim:true,
            maxlength: [100, "Title cannot exceed 100 characters."],
        },
        description: {
            type: String,
            required: [true, "Description is required."],
            trim:true,
            maxlength: [500, "Description cannot exceed 500 characters."],
        },
        content: {
            type: String,
            required: [true, "Content is required."],
        },
        visibility: {
            type: String,
            enum: ['public', 'private'],
            default: 'public',
        },
        tags: {
            type: [String],
            default: [],
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User',
            required: true,
        },
        allowedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        accessRequests: [
            {
                user: {
                    type:mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                requestedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        attachments: [
            {
                filename: String,
                url: String,
                fileType: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {timestamps: true}
);

moduleSchema.index(
    {
        title: 'text',
        description: 'text',
        tags: 'text'
    }
);

const Module= mongoose.model('Module', moduleSchema);
export default Module;