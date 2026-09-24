const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        permission: {
            type: String,
            enum: ["admin", "regular_user"],
            default: "regular_user"
        },
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
        ]
    },
    {

        timestamps: true
    }
);


module.exports = mongoose.model("User", userSchema);