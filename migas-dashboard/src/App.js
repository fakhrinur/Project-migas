// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';

// CRUD Pages (Create)
import CpAramcoPage from './pages/crud/CpAramcoPage';
import KursPage from './pages/crud/KursPage';
import LpgNasionalPage from './pages/crud/LpgNasionalPage';
import LpgProvinsiPage from './pages/crud/LpgProvinsiPage';

// EDIT Pages (Update)
import CpAramcoEdit from './pages/edit/CpAramcoEdit';      // ✅ Pastikan path sesuai folder Anda
import KursEdit from './pages/edit/KursEdit';
import LpgNasionalEdit from './pages/edit/LpgNasionalEdit';
import LpgProvinsiEdit from './pages/edit/LpgProvinsiEdit';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Nested Routes di bawah /dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          
          {/* Form Input (Create) */}
          <Route path="cp-aramco" element={<CpAramcoPage />} />
          <Route path="kurs-data" element={<KursPage />} />
          <Route path="lpg-nasional" element={<LpgNasionalPage />} />
          <Route path="lpg-provinsi" element={<LpgProvinsiPage />} />
          
          {/* ✅ HALAMAN EDIT — TAMBAHKAN INI! */}
          <Route path="cp-aramco/edit/:id" element={<CpAramcoEdit />} />
          <Route path="kurs-data/edit/:id" element={<KursEdit />} />
          <Route path="lpg-nasional/edit/:id" element={<LpgNasionalEdit />} />
          <Route path="lpg-provinsi/edit/:id" element={<LpgProvinsiEdit />} />
        </Route>
        
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}