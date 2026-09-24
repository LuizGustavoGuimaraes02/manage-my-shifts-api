const bcrypt = require("bcryptjs");
const User = require("../models/User");

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

module.exports = { createUser };