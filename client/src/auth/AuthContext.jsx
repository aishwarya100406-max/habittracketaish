import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const login = (email, password) => {
        const savedUser = JSON.parse(localStorage.getItem("registeredUser"));

        if (!savedUser || savedUser.email !== email || savedUser.password !== password) {
            throw new Error("Invalid credentials");
        }

        localStorage.setItem("user", JSON.stringify(savedUser));
        setUser(savedUser);
    };

    const register = (email, password) => {
        localStorage.setItem(
            "registeredUser",
            JSON.stringify({ email, password })
        );
    };

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
