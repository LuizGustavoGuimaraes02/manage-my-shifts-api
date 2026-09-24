const express = require("express");
const router = express.Router();
const {
    getAllShifts,
    getShiftById,
    createShift,
    updateShift,
    deleteShift
} = require("../controllers/shiftController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

router.get("/", requireAuth, requireAdmin, getAllShifts);
router.get("/:id", requireAuth, getShiftById);
router.post("/", requireAuth, createShift);
router.patch("/:id", requireAuth, updateShift);
router.delete("/:id", requireAuth, requireAdmin, deleteShift);

module.exports = router;