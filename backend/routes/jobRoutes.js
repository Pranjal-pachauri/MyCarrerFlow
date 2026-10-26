const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getJobFilters
} = require("../controllers/jobController");


// Admin creates job
router.post(
    "/",
    protect,
    authorize("admin"),
    createJob
);


// Anyone can view jobs
router.get(
    "/filters",
    getJobFilters
);
router.get(
    "/",
    getJobs
);


// Get single job
router.get(
    "/:id",
    getJobById
);


// Admin updates job
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateJob
);


// Admin deletes job
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteJob
);


module.exports = router;