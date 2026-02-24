// src/pages/crud/LpgProvinsiPage.jsx
import React from 'react';
import LpgProvinsiCrud from '../../components/crud/LpgProvinsiCrud';

export default function LpgProvinsiPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-amber-400 mb-4">Manajemen Data LPG Provinsi</h2>
      <LpgProvinsiCrud />
    </div>
  );
}