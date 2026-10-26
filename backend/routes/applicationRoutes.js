const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
    applyJob,
    myApplications,
    getAllApplications,
    updateApplicationStatus,
    downloadApplicationResume,
    getMyJobApplication,
    withdrawApplication
} = require("../controllers/applicationController");

const upload =
    require("../middleware/uploadMiddleware");

router.post(
    "/:jobId",
    protect,
    authorize("student"),
    upload.single("resume"),
    applyJob
);
router.get(
    "/job/:jobId/my",
    protect,
    authorize("student"),
    getMyJobApplication
);


router.get(
    "/my",
    protect,
    authorize("student"),
    myApplications
);


router.get(
    "/",
    protect,
    authorize("admin"),
    getAllApplications
);



router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateApplicationStatus
);

router.patch(
    "/:id/withdraw",
    protect,
    withdrawApplication
);

router.get(
    "/:id/resume",
    protect,
    downloadApplicationResume
);

module.exports = router;