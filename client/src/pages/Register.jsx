import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        register(email, password);
        navigate("/login");
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Register</button>
        </form>
    );
};

export default Register;
