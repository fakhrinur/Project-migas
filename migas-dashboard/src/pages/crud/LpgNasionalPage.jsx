// src/pages/crud/LpgNasionalPage.jsx
import LpgNasionalCrud from '../../components/crud/LpgNasionalCrud';

export default function LpgNasionalPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-amber-400 mb-4">Manajemen Data LPG Nasional</h2>
      <LpgNasionalCrud />
    </div>
  );
}