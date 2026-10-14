const bcrypt = require("bcryptjs");
const { signToken } = require("../auth/authModule");
const User = require("../models/User");

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        
        if (user === null) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

          const token = signToken({
            _id: user._id,
            permission: user.permission,
            secret: process.env.JWT_SECRET,
            expireTime: "1h"
        });

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong during login." });
    }
}

module.exports = { login };