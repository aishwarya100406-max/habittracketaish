import React from 'react'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <main className="min-h-screen">
        <ToastContainer position="top-right" autoClose={2000} theme="dark" />
        <Outlet />
      </main>
    </div>
  )
}

export default Layout