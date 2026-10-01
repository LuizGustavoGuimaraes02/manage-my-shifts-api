const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Shift = require("../models/Shift");
const Comment = require("../models/Comment");

const SALT_ROUNDS = 10;

    async function createUser(req, res) {
    try {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser !== null) {
            return res.status(409).json({ message: "This email is already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });

        const { password: _, ...publicUser } = newUser.toObject();

        res.status(201).json(publicUser);
    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({ message: "This email is already registered." });
        }

        console.error(error);
        res.status(500).json({ message: "Something went wrong while creating the user." });
    }
    }
    
    async function updateUser(req, res) {
    try {
        const targetUser = await User.findById(req.params.id);

        if (targetUser === null) {
            return res.status(404).json({ message: "User not found." });
        }

        const isSelf = targetUser._id.toString() === req.user.id;

        if (!isSelf && req.user.permission !== "admin") {
            return res.status(403).json({ message: "You cannot edit this user." });
        }

        const { email, password, firstName, lastName } = req.body;

        if (email !== undefined) {
            const existing = await User.findOne({ email: email.toLowerCase() });

            if (existing !== null && existing._id.toString() !== targetUser._id.toString()) {
                return res.status(409).json({ message: "This email is already registered." });
            }

            targetUser.email = email.toLowerCase();
        }

        if (firstName !== undefined) targetUser.firstName = firstName;
        if (lastName !== undefined) targetUser.lastName = lastName;

        if (password) {
            targetUser.password = await bcrypt.hash(password, SALT_ROUNDS);
        }

        await targetUser.save();

        const { password: _, ...publicUser } = targetUser.toObject();
        res.status(200).json(publicUser);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "This email is already registered." });
        }

        console.error(error);
        res.status(500).json({ message: "Something went wrong while updating the user." });
    }
    }

    async function deleteUser(req, res) {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);

            if (deletedUser === null) {
                return res.status(404).json({ message: "User not found." });
            }

            await Shift.deleteMany({ userId: deletedUser._id });
            await Comment.deleteMany({ userId: deletedUser._id });

            res.status(200).json({ message: "User and all associated data deleted." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Something went wrong while deleting the user." });
        }
    }

module.exports = { createUser, updateUser, deleteUser };

