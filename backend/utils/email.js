const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendPasswordResetEmail = async (
    email,
    resetUrl
) => {

    await transporter.sendMail({
        from: `"MyCareerFlow" <${process.env.SMTP_USER}>`,

        to: email,

        subject: "Reset your MyCareerFlow password",

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
                color: #222;
            ">

                <h2>
                    Reset your password
                </h2>

                <p>
                    We received a request to reset your
                    MyCareerFlow password.
                </p>

                <p>
                    Click the button below to create a
                    new password.
                </p>

                <div style="margin: 30px 0;">

                    <a
                        href="${resetUrl}"
                        style="
                            background:#2563eb;
                            color:white;
                            padding:12px 22px;
                            text-decoration:none;
                            border-radius:6px;
                            display:inline-block;
                        "
                    >
                        Reset Password
                    </a>

                </div>

                <p>
                    This link will expire in 15 minutes.
                </p>

                <p>
                    If you did not request this,
                    you can safely ignore this email.
                </p>

                <hr />

                <p style="font-size:12px;color:#777;">
                    MyCareerFlow — Career & Placement Management
                </p>

            </div>
        `
    });
};

const sendPasswordResetConfirmation = async (
    email
) => {

    await transporter.sendMail({
        from: `"MyCareerFlow" <${process.env.SMTP_USER}>`,

        to: email,

        subject: "Your MyCareerFlow password was changed",

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
            ">

                <h2>Password changed successfully</h2>

                <p>
                    Your MyCareerFlow password has been
                    changed successfully.
                </p>

                <p>
                    If you did not make this change,
                    please contact support immediately.
                </p>

            </div>`
        
    });
};

module.exports = {
    sendPasswordResetEmail,
    sendPasswordResetConfirmation
};