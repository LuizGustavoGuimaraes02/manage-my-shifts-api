const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");
const { createUser, updateUser, deleteUser } = require("../controllers/userController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

router.get("/me", requireAuth, (req, res) => {
    res.json({ message: "You are authenticated.", user: req.user });
});

router.post("/", createUser);
router.post("/login", login);
router.patch("/:id", requireAuth, updateUser);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

module.exports = router;