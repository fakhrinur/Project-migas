// src/pages/crud/KursPage.jsx
import React from 'react';
import KursCrud from '../../components/crud/KursCrud';

export default function KursPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-amber-400 mb-4">Manajemen Data Kurs</h2>
      <KursCrud />
    </div>
  );
}