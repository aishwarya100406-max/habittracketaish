// client/src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import AddHabit from './pages/AddHabit.jsx'
import CompareHabits from './pages/CompareHabits.jsx'
import WeeklySummary from './pages/WeeklySummary.jsx'
import Layout from './components/layout/Layout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'addHabit',
        element: (
          <ProtectedRoute>
            <AddHabit />
          </ProtectedRoute>
        )
      },
      {
        path: 'compare',
        element: (
          <ProtectedRoute>
            <CompareHabits />
          </ProtectedRoute>
        )
      },
      {
        path: 'summary',
        element: (
          <ProtectedRoute>
            <WeeklySummary />
          </ProtectedRoute>
        )
      }
    ]
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)