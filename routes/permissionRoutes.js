const express = require("express");
const router = express.Router();
const { getAllPermissions } = require("../controllers/permissionController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, getAllPermissions);

module.exports = router;