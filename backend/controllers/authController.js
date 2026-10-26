const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const crypto = require("crypto");



const {
    sendPasswordResetEmail,
    sendPasswordResetConfirmation
} = require("../utils/email");    

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Please enter your email"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        /*
         * Always return the same response.
         * This prevents attackers from checking
         * which emails are registered.
         */
        if (!user) {
            return res.json({
                message:
                    "If an account exists with this email, a password reset link has been sent."
            });
        }

        const rawToken =
            crypto.randomBytes(32).toString("hex");

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(rawToken)
                .digest("hex");

        user.resetPasswordTokenHash = tokenHash;

        user.resetPasswordExpires =
            Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetUrl =
            `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

        await sendPasswordResetEmail(
            user.email,
            resetUrl
        );

        res.json({
            message:
                "If an account exists with this email, a password reset link has been sent."
        });

    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to process password reset request"
        });
    }
};


const resetPassword = async (req, res) => {
    try {

        const { token } = req.params;

        const { password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters"
            });
        }

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

        const user = await User.findOne({
            resetPasswordTokenHash: tokenHash,

            resetPasswordExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).json({
                message:
                    "Reset link is invalid or expired"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 12);

        user.password = hashedPassword;

        // Token becomes invalid immediately
        user.resetPasswordTokenHash = "";

        user.resetPasswordExpires = null;

        await user.save();

        try {
            await sendPasswordResetConfirmation(
                user.email
            );
        } catch (emailError) {
            console.error(
                "Password confirmation email failed:",
                emailError.message
            );
        }

        res.json({
            message:
                "Password reset successfully. Please login again."
        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to reset password"
        });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        const { OAuth2Client } =
         await import("google-auth-library");

        if (!credential) {
            return res.status(400).json({
                message: "Google credential is required"
            });
        }

        const client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID
        );

        const ticket =
            await client.verifyIdToken({
                idToken: credential,
                audience:
                    process.env.GOOGLE_CLIENT_ID
            });

        const payload =
            ticket.getPayload();

        if (!payload) {
            return res.status(401).json({
                message: "Invalid Google credential"
            });
        }

        const {
            sub: googleId,
            email,
            name,
            picture
        } = payload;

        if (!email) {
            return res.status(400).json({
                message:
                    "Google account email not available"
            });
        }

        let user =
            await User.findOne({
                googleId
            });

        if (!user) {
            user =
                await User.findOne({
                    email
                });

            if (user) {
                user.googleId = googleId;

                if (picture) {
                    user.avatar = picture;
                }

                await user.save();

            } else {
                const randomPassword = crypto.randomBytes(32).toString("hex");

                const hashedPassword = await bcrypt.hash(randomPassword, 12);
                user = await User.create({
                    name: name || email.split("@")[0],
                    email: email.toLowerCase().trim(),
                    password: hashedPassword,
                    googleId,
                    avatar: picture || "",
                    role: "student"
                });
            }
        }

        const token =
            jwt.sign(
                {
                    id: user._id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

        res.json({
            message:
                "Google login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                resume: user.resume,
                profile: user.profile
            }
        });

    } catch (error) {

        console.error(
            "Google login error:",
            error
        );

        res.status(401).json({
            message:
                "Google authentication failed"
        });
    }
};

module.exports = {
    register,
    login,
    googleLogin,
    forgotPassword,
    resetPassword
};