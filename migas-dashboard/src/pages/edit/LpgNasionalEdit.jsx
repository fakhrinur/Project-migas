// src/pages/LpgNasionalEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function LpgNasionalEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Tanggal: '',
    Bulan: '',
    Volume: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/lpg-nasional/${id}`);
        const data = await res.json();
        const dateStr = data.Tanggal ? new Date(data.Tanggal).toISOString().split('T')[0] : '';
        setFormData({
          Tanggal: dateStr,
          Bulan: data.Bulan || '',
          Volume: data.Volume ?? ''
        });
      } catch (err) {
        alert('Gagal memuat data LPG Nasional');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        Tanggal: formData.Tanggal,
        Bulan: formData.Bulan,
        Volume: formData.Volume === '' ? null : Number(formData.Volume)
      };

      const res = await fetch(`http://localhost:5000/api/lpg-nasional/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        window.dispatchEvent(new Event('dashboard:refresh'));
        navigate('/dashboard');
      } else {
        alert('Gagal menyimpan');
      }
    } catch (err) {
      alert('Error saat menyimpan');
    }
  };

  if (loading) return <div className="p-6 text-gray-300">Memuat...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto text-gray-200">
      <h2 className="text-2xl font-bold mb-4">✏️ Edit LPG Nasional</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Tanggal</label>
          <input
            type="date"
            value={formData.Tanggal}
            onChange={(e) => setFormData({ ...formData, Tanggal: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Bulan</label>
          <input
            type="text"
            value={formData.Bulan}
            onChange={(e) => setFormData({ ...formData, Bulan: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Volume (Kg)</label>
          <input
            type="number"
            value={formData.Volume}
            onChange={(e) => setFormData({ ...formData, Volume: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            required
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 rounded text-white">Simpan</button>
          <button type="button" onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-600 rounded text-white">Batal</button>
        </div>
      </form>
    </div>
  );
}