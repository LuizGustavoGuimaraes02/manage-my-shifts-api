const Comment = require("../models/Comment");

async function getAllComments(req, res) {
    try {
        const comments = await Comment.find().populate("userId", "firstName lastName email");
        res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while fetching comments." });
    }
}

async function getCommentById(req, res) {
    try {
        const comment = await Comment.findById(req.params.id);

        if (comment === null) {
            return res.status(404).json({ message: "Comment not found." });
        }

        res.status(200).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while fetching the comment." });
    }
}

async function createComment(req, res) {
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ message: "Description is required." });
        }

        const newComment = await Comment.create({
            userId: req.user.id,
            description
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while creating the comment." });
    }
}

async function updateComment(req, res) {
    try {
        const comment = await Comment.findById(req.params.id);

        if (comment === null) {
            return res.status(404).json({ message: "Comment not found." });
        }

        const isOwner = comment.userId.toString() === req.user.id;

        if (!isOwner && req.user.permission !== "admin") {
            return res.status(403).json({ message: "You cannot edit this comment." });
        }

        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ message: "Description is required." });
        }

        comment.description = description;
        await comment.save();

        res.status(200).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while updating the comment." });
    }
}

async function deleteComment(req, res) {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);

        if (comment === null) {
            return res.status(404).json({ message: "Comment not found." });
        }

        res.status(200).json({ message: "Comment deleted." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while deleting the comment." });
    }
}

async function getCommentsByUser(req, res) {
    try {
        const comments = await Comment.find({ userId: req.params.userId });
        res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while fetching the user's comments." });
    }
}

module.exports = {
    getAllComments,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
    getCommentsByUser
};