const express = require("express");
const router = express.Router();
const { createUser } = require("../controllers/userController");
const { login } = require("../controllers/authController");

const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

router.get("/me", requireAuth, (req, res) => {
    res.json({ message: "You are authenticated.", user: req.user });
});

router.post("/", createUser);
router.post("/login", login);

module.exports = router;