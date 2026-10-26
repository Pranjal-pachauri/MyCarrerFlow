import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    useEffect(() => {
        const getUser = async () => {
            try {
                const token = localStorage.getItem("token");

                if (token) {
                    const res = await api.get("/profile");

                    // Supports both { user: ... } and direct user responses.
                    setUser(res.data.user || res.data);
                }
            } catch (error) {
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post("/auth/login", {
            email,
            password
        });

        const token = res.data.token;

        if (!token) {
            throw new Error("Login response did not contain a token.");
        }

        localStorage.setItem("token", token);

        try {
            const profile = await api.get("/profile");

            const loggedInUser = profile.data.user || profile.data;

            if (!loggedInUser || !loggedInUser._id) {
                throw new Error("Could not load the user profile.");
            }

            setUser(loggedInUser);
        } catch (error) {
            localStorage.removeItem("token");
            setUser(null);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading,
                updateUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
