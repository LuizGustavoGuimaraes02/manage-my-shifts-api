const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    resetPassword
} = require("../controllers/userController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

router.get("/me", requireAuth, (req, res) => {
    res.json({ message: "You are authenticated.", user: req.user });
});

router.post("/", createUser);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.get("/", requireAuth, requireAdmin, getAllUsers);
router.get("/:id", requireAuth, getUserById);
router.patch("/:id", requireAuth, updateUser);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

module.exports = router;