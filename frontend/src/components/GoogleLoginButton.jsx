import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

function GoogleLoginButton({
    from = "/dashboard",
    applyJobId
}) {

    const navigate = useNavigate();
    const buttonRef = useRef(null);

    useEffect(() => {

        if (!window.google) {
            return;
        }

        window.google.accounts.id.initialize({
            client_id:
                import.meta.env
                    .VITE_GOOGLE_CLIENT_ID,

            callback: handleGoogleResponse
        });

        if (buttonRef.current) {

            window.google.accounts.id.renderButton(
                buttonRef.current,
                {
                    theme: "outline",
                    size: "large",
                    width: 350,
                    text: "continue_with",
                    shape: "rectangular"
                }
            );
        }

    }, []);


    const handleGoogleResponse = async (
        response
    ) => {

        try {

            const res =
                await api.post(
                    "/auth/google",
                    {
                        credential:
                            response.credential
                    }
                );

            localStorage.setItem(
                "token",
                res.data.token
            );

         if (applyJobId) {
    navigate(`/jobs/${applyJobId}`, {
        replace: true,
        state: {
            openApplicationModal: true
        }
    });
} else {
    navigate(from || "/dashboard", {
        replace: true
    });
}

            

            window.location.reload();

        } catch (error) {

            console.error(
                "Google login failed:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Google login failed"
            );
        }
    };


    return (
        <div
            ref={buttonRef}
            className="google-login-button"
        />
    );
}

export default GoogleLoginButton;