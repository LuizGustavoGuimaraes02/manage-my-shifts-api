const Permission = require("../models/Permission");

async function getAllPermissions(req, res) {
    try {
        const permissions = await Permission.find();
        res.status(200).json(permissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while fetching permissions." });
    }
}

module.exports = { getAllPermissions };