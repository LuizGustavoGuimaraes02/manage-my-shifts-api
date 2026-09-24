const Shift = require("../models/Shift");

async function getAllShifts(req, res) {
    try {
        const shifts = await Shift.find().populate("userId", "firstName lastName email");
        res.status(200).json(shifts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while fetching shifts." });
    }
}

async function getShiftById(req, res) {
    try {
        const shift = await Shift.findById(req.params.id);

        if (shift === null) {
            return res.status(404).json({ message: "Shift not found." });
        }

        const isOwner = shift.userId.toString() === req.user.id;

        if (!isOwner && req.user.permission !== "admin") {
            return res.status(403).json({ message: "You cannot view this shift." });
        }

        res.status(200).json(shift);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while fetching the shift." });
    }
}

async function createShift(req, res) {
    try {
        const { start, end, perHour, place } = req.body;

        if (!start || !end || perHour === undefined || !place) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (new Date(end) <= new Date(start)) {
            return res.status(400).json({ message: "End time must be after start time." });
        }

        if (perHour < 0) {
            return res.status(400).json({ message: "Hourly rate cannot be negative." });
        }

        const newShift = await Shift.create({
            userId: req.user.id,
            start,
            end,
            perHour,
            place
        });

        res.status(201).json(newShift);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while creating the shift." });
    }
}

async function updateShift(req, res) {
    try {
        const shift = await Shift.findById(req.params.id);

        if (shift === null) {
            return res.status(404).json({ message: "Shift not found." });
        }

        const isOwner = shift.userId.toString() === req.user.id;

        if (!isOwner && req.user.permission !== "admin") {
            return res.status(403).json({ message: "You cannot edit this shift." });
        }

        const { start, end, perHour, place } = req.body;

        if (start !== undefined) shift.start = start;
        if (end !== undefined) shift.end = end;
        if (perHour !== undefined) shift.perHour = perHour;
        if (place !== undefined) shift.place = place;

        if (new Date(shift.end) <= new Date(shift.start)) {
            return res.status(400).json({ message: "End time must be after start time." });
        }

        await shift.save();
        res.status(200).json(shift);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while updating the shift." });
    }
}

async function deleteShift(req, res) {
    try {
        const shift = await Shift.findByIdAndDelete(req.params.id);

        if (shift === null) {
            return res.status(404).json({ message: "Shift not found." });
        }

        res.status(200).json({ message: "Shift deleted." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while deleting the shift." });
    }
}

module.exports = { getAllShifts, getShiftById, createShift, updateShift, deleteShift };