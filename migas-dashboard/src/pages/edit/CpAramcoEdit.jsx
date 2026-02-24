// src/pages/CpAramcoEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function CpAramcoEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Tanggal: '',
    Bulan: '',
    CPA_C3: '',
    CPA_C4: '',
    HIP_LPG_USD_Per_MT: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/cp-aramco/${id}`);
        const data = await res.json();

        // Format tanggal ke YYYY-MM-DD untuk input type="date"
        const dateStr = data.Tanggal ? new Date(data.Tanggal).toISOString().split('T')[0] : '';

        setFormData({
          Tanggal: dateStr,
          Bulan: data.Bulan || '',
          CPA_C3: data.CPA_C3 ?? '',
          CPA_C4: data.CPA_C4 ?? '',
          HIP_LPG_USD_Per_MT: data.hip_lpg ?? ''
        });
      } catch (err) {
        console.error('Gagal memuat data:', err);
        alert('Gagal memuat data CP Aramco');
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
        CPA_C3: formData.CPA_C3 === '' ? null : Number(formData.CPA_C3),
        CPA_C4: formData.CPA_C4 === '' ? null : Number(formData.CPA_C4),
        HIP_LPG_USD_Per_MT: formData.HIP_LPG_USD_Per_MT === '' ? null : Number(formData.HIP_LPG_USD_Per_MT)
      };

      const res = await fetch(`http://localhost:5000/api/cp-aramco/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        window.dispatchEvent(new Event('dashboard:refresh'));
        navigate('/dashboard');
      } else {
        alert('Gagal menyimpan perubahan');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Terjadi kesalahan saat menyimpan');
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-300">Memuat data...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto text-gray-200">
      <h2 className="text-2xl font-bold mb-4">✏️ Edit CP Aramco</h2>
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
          <label className="block text-sm mb-1">CPA C3 (USD/MT)</label>
          <input
            type="number"
            step="0.01"
            value={formData.CPA_C3}
            onChange={(e) => setFormData({ ...formData, CPA_C3: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">CPA C4 (USD/MT)</label>
          <input
            type="number"
            step="0.01"
            value={formData.CPA_C4}
            onChange={(e) => setFormData({ ...formData, CPA_C4: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">HIP LPG (USD/MT)</label>
          <input
            type="number"
            step="0.01"
            value={formData.HIP_LPG_USD_Per_MT}
            onChange={(e) => setFormData({ ...formData, HIP_LPG_USD_Per_MT: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Simpan Perubahan
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}