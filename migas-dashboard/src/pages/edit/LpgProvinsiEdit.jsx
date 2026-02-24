// src/pages/LpgProvinsiEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function LpgProvinsiEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Tanggal: '',
    Bulan: '',
    Propinsi: '',
    MOR: '',
    Volume: '',
    Kuota: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/lpg-provinsi/${id}`);
        const data = await res.json();
        const dateStr = data.Tanggal ? new Date(data.Tanggal).toISOString().split('T')[0] : '';
        setFormData({
          Tanggal: dateStr,
          Bulan: data.Bulan || '',
          Propinsi: data.Propinsi || '',
          MOR: data.MOR || '',
          Volume: data.Volume ?? '',
          Kuota: data.Kuota ?? ''
        });
      } catch (err) {
        alert('Gagal memuat data LPG Provinsi');
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
        Propinsi: formData.Propinsi,
        MOR: formData.MOR,
        Volume: formData.Volume === '' ? null : Number(formData.Volume),
        Kuota: formData.Kuota === '' ? null : Number(formData.Kuota)
      };

      // ✅ Perbaikan: Hapus "/" di awal URL
      const res = await fetch(`http://localhost:5000/api/lpg-provinsi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        window.dispatchEvent(new Event('dashboard:refresh'));
        navigate('/dashboard');
      } else {
        const errorText = await res.text();
        alert(`Gagal menyimpan perubahan:\n${errorText}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  if (loading) return <div className="p-6 text-gray-300">Memuat...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto text-gray-200">
      <h2 className="text-2xl font-bold mb-4">✏️ Edit LPG Provinsi</h2>
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
          <label className="block text-sm mb-1">Provinsi</label>
          <input
            type="text"
            value={formData.Propinsi}
            onChange={(e) => setFormData({ ...formData, Propinsi: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">MOR</label>
          <input
            type="text"
            value={formData.MOR}
            onChange={(e) => setFormData({ ...formData, MOR: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
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
        <div>
          <label className="block text-sm mb-1">Kuota (Kg)</label>
          <input
            type="number"
            value={formData.Kuota}
            onChange={(e) => setFormData({ ...formData, Kuota: e.target.value })}
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