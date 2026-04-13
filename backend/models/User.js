import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema= new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required."],
            trim:true,
        },
        email: {
            type: String,
            required: [true, "Email is required."],
            unique:true,
            trim:true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address."],
        },
        password: {
            type: String,
            required: true,
            minlength: [10, "Password must be at least 10 characters long."],
            match: [
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                "Password must include uppercase, lowercase, number, and special character."
            ],
        },
        role: {
            type: String,
            enum: {
                values: ['student', 'instructor'],
                message: "Role not available",
            },
            required: [true, "Role is required."],
        },
    },
    {timestamps: true}
);

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    const salt= await bcrypt.genSalt(10);
    this.password= await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword= async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User= mongoose.model("User", userSchema);
export default User;
