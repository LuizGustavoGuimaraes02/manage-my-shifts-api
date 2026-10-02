const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Shift = require("../models/Shift");
const Comment = require("../models/Comment");

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;
const MIN_AGE = 6;
const MAX_AGE = 130;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUPLICATE_KEY_ERROR_CODE = 11000;
const DUPLICATE_EMAIL_MESSAGE = "This email is already registered.";

function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const hadBirthdayThisYear =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hadBirthdayThisYear) {
        age -= 1;
    }

    return age;
}

function isValidBirthDate(value) {
    const birthDate = new Date(value);

    if (Number.isNaN(birthDate.getTime())) {
        return false;
    }

    const age = calculateAge(birthDate);

    return age >= MIN_AGE && age <= MAX_AGE;
}

function validateUserData({ email, password, firstName, lastName, birthDate }) {
    if (email !== undefined && !EMAIL_PATTERN.test(email)) {
        return "A valid email is required.";
    }

    if (password !== undefined && password.length < MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
    }

    if (firstName !== undefined && firstName.trim().length < MIN_NAME_LENGTH) {
        return `First name must have at least ${MIN_NAME_LENGTH} characters.`;
    }

    if (lastName !== undefined && lastName.trim().length < MIN_NAME_LENGTH) {
        return `Last name must have at least ${MIN_NAME_LENGTH} characters.`;
    }

    if (birthDate !== undefined && !isValidBirthDate(birthDate)) {
        return `Birth date must correspond to an age between ${MIN_AGE} and ${MAX_AGE}.`;
    }

    return null;
}

async function createUser(req, res) {
    try {
        const { email, password, firstName, lastName, birthDate } = req.body;

        if (!email || !password || !firstName || !lastName || !birthDate) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const validationError = validateUserData({ email, password, firstName, lastName, birthDate });

        if (validationError !== null) {
            return res.status(400).json({ message: validationError });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser !== null) {
            return res.status(409).json({ message: DUPLICATE_EMAIL_MESSAGE });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            birthDate
        });

        const { password: _, ...publicUser } = newUser.toObject();

        res.status(201).json(publicUser);
    } catch (error) {
        if (error.code === DUPLICATE_KEY_ERROR_CODE) {
            return res.status(409).json({ message: DUPLICATE_EMAIL_MESSAGE });
        }

        console.error(error);
        res.status(500).json({ message: "Something went wrong while creating the user." });
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await User.find().select("-password").sort({ lastName: 1, firstName: 1 });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while fetching users." });
    }
}

async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (user === null) {
            return res.status(404).json({ message: "User not found." });
        }

        const isSelf = user._id.toString() === req.user.id;

        if (!isSelf && req.user.permission !== "admin") {
            return res.status(403).json({ message: "You cannot view this user." });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while fetching the user." });
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

        const { email, password, firstName, lastName, birthDate } = req.body;

        const validationError = validateUserData({
            email,
            password: password || undefined,
            firstName,
            lastName,
            birthDate
        });

        if (validationError !== null) {
            return res.status(400).json({ message: validationError });
        }

        if (email !== undefined) {
            const existing = await User.findOne({ email: email.toLowerCase() });

            if (existing !== null && existing._id.toString() !== targetUser._id.toString()) {
                return res.status(409).json({ message: DUPLICATE_EMAIL_MESSAGE });
            }

            targetUser.email = email.toLowerCase();
        }

        if (firstName !== undefined) targetUser.firstName = firstName;
        if (lastName !== undefined) targetUser.lastName = lastName;
        if (birthDate !== undefined) targetUser.birthDate = birthDate;

        if (password) {
            targetUser.password = await bcrypt.hash(password, SALT_ROUNDS);
        }

        await targetUser.save();

        const { password: _, ...publicUser } = targetUser.toObject();
        res.status(200).json(publicUser);
    } catch (error) {
        if (error.code === DUPLICATE_KEY_ERROR_CODE) {
            return res.status(409).json({ message: DUPLICATE_EMAIL_MESSAGE });
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

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser };