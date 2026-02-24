// src/pages/KursEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function KursEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Tanggal: '',
    periode_perhitungan_lpg: '',
    kurs_beli: '',
    kurs_jual: '',
    kurs_tengah: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/kurs/${id}`);
        const data = await res.json();
        const dateStr = data.Tanggal ? new Date(data.Tanggal).toISOString().split('T')[0] : '';
        setFormData({
          Tanggal: dateStr,
          periode_perhitungan_lpg: data.periode_perhitungan_lpg || '',
          kurs_beli: data.kurs_beli ?? '',
          kurs_jual: data.kurs_jual ?? '',
          kurs_tengah: data.kurs_tengah ?? ''
        });
      } catch (err) {
        alert('Gagal memuat data Kurs');
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
        Periode_Perhitungan_LPG: formData.periode_perhitungan_lpg,
        Kurs_Beli: formData.kurs_beli === '' ? null : Number(formData.kurs_beli),
        Kurs_Jual: formData.kurs_jual === '' ? null : Number(formData.kurs_jual),
        Kurs_Tengah: formData.kurs_tengah === '' ? null : Number(formData.kurs_tengah)
      };

      const res = await fetch(`http://localhost:5000/api/kurs/${id}`, {
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
      alert('Terjadi kesalahan');
    }
  };

  if (loading) return <div className="p-6 text-gray-300">Memuat...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto text-gray-200">
      <h2 className="text-2xl font-bold mb-4">✏️ Edit Kurs</h2>
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
          <label className="block text-sm mb-1">Periode Perhitungan LPG</label>
          <input
            type="text"
            value={formData.periode_perhitungan_lpg}
            onChange={(e) => setFormData({ ...formData, periode_perhitungan_lpg: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Kurs Beli (IDR)</label>
          <input
            type="number"
            value={formData.kurs_beli}
            onChange={(e) => setFormData({ ...formData, kurs_beli: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Kurs Jual (IDR)</label>
          <input
            type="number"
            value={formData.kurs_jual}
            onChange={(e) => setFormData({ ...formData, kurs_jual: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Kurs Tengah (IDR)</label>
          <input
            type="number"
            value={formData.kurs_tengah}
            onChange={(e) => setFormData({ ...formData, kurs_tengah: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
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