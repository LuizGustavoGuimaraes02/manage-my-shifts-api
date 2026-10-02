const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        },
        perHour: {
            type: Number,
            required: true,
            min: 0
        },
        place: {
            type: String,
            required: true,
            trim: true
        },
        comments: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

shiftSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Shift", shiftSchema);