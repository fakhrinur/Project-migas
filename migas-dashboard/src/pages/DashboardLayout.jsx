// src/pages/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar isCollapsed={!sidebarOpen} />

      {/* Konten Utama */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 p-4 flex items-center shadow-md">
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-orange-400 focus:outline-none mr-4"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <h1 className="text-xl font-semibold">Dashboard Migas</h1>
          {/* Anda bisa tambahkan notifikasi, user menu, dll di sini nanti */}
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="p-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;