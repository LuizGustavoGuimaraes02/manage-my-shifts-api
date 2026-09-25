const express = require("express");
const router = express.Router();
const {
    getAllComments,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
    getCommentsByUser
} = require("../controllers/commentController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

router.get("/", requireAuth, requireAdmin, getAllComments);
router.get("/user/:userId", requireAuth, getCommentsByUser);
router.get("/:id", requireAuth, getCommentById);
router.post("/", requireAuth, createComment);
router.patch("/:id", requireAuth, updateComment);
router.delete("/:id", requireAuth, requireAdmin, deleteComment);

module.exports = router;