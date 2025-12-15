import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import WeeklySummary from "./pages/WeeklySummary";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Habits from "./pages/Habits";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/habits" replace />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected route */}
          <Route
            path="/weekly-summary"
            element={
              <ProtectedRoute>
                <WeeklySummary habits={habits} />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
