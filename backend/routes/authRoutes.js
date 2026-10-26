const express = require("express");
const rateLimit = require("express-rate-limit");
const {
    register,
    login,
    googleLogin,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const router = express.Router();
const forgotPasswordLimiter =
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,

        message: {
            message:
                "Too many password reset requests. Please try again later."
        }
    });
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    forgotPassword
);

router.post(
    "/reset-password/:token",
    resetPassword
);
    
router.post(
    "/register",
    register
);

router.post(
    "/login",
    login
);

router.post(
    "/google",
    googleLogin
);

module.exports = router;