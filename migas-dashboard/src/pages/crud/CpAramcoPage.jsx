// src/pages/crud/CpAramcoPage.jsx
import React from 'react';
import CpAramcoCrud from '../../components/crud/CpAramcoCrud';

export default function CpAramcoPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-amber-400 mb-4">Manajemen Data CP Aramco</h2>
      <CpAramcoCrud />
    </div>
  );
}