import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from './components/ProtectedRoute'
import WeeklySummary from "./pages/WeeklySummary";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from './pages/Dashboard'
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <AuthProvider>

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
      </BrowserRouter >
    </AuthProvider >
  );
}

export default App;
