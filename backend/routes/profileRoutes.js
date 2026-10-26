const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    getProfile,
    updateProfile,
    uploadResume,
    deleteResume,
    downloadResume
} = require("../controllers/profilecontroller");

// Get logged-in user's profile
router.get("/", protect, getProfile);

// Update logged-in user's profile
router.put("/", protect, updateProfile);

// Upload or replace profile resume
router.post(
    "/resume",
    protect,
    upload.single("resume"),
    uploadResume
);

// Download logged-in user's own resume
router.get("/resume", protect, downloadResume);

// Delete logged-in user's resume
router.delete("/resume", protect, deleteResume);

module.exports = router;