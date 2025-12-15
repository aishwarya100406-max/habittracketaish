import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    useEffect(() => {
        if (token) {
            // In a real app, you'd validate the token with /api/auth/me
            // For now, we trust the token exists and maybe decode it or just check storage
            // But let's keep it simple: if token, we assume logged in.
            // Ideally we'd decoding it to get user info or store user info in localStorage too
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) setUser(storedUser);
        }
    }, [token]);

    const login = async (email, password) => {
        // api.post throws if error, so we just await it
        const data = await api.post("/auth/login", { email, password });

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return true;
    };

    const register = async (email, password) => {
        await api.post("/auth/register", { email, password });
        return true;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
