// src/components/crud/KursCrud.jsx
import { useState, useEffect } from 'react';

export default function KursCrud() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    Tanggal: '',
    Periode_Perhitungan_LPG: '',
    Kurs_Beli: '',
    Kurs_Jual: '',
    Kurs_Tengah: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchData = () => {
    fetch('http://localhost:5000/api/kurs')
      .then(res => res.json())
      .then(setData);
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId 
      ? `http://localhost:5000/api/kurs/${editingId}`
      : 'http://localhost:5000/api/kurs';
    const method = editingId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Tanggal: form.Tanggal,
        Periode_Perhitungan_LPG: form.Periode_Perhitungan_LPG,
        Kurs_Beli: form.Kurs_Beli,
        Kurs_Jual: form.Kurs_Jual,
        Kurs_Tengah: form.Kurs_Tengah
      })
    });

    setForm({ Tanggal: '', Periode_Perhitungan_LPG: '', Kurs_Beli: '', Kurs_Jual: '', Kurs_Tengah: '' });
    setEditingId(null);
    fetchData();
  };

  const handleEdit = (item) => {
    setForm({
      Tanggal: item.Tanggal?.split('T')[0] || '',
      Periode_Perhitungan_LPG: item.periode_perhitungan_lpg || '',
      Kurs_Beli: item.kurs_beli || '',
      Kurs_Jual: item.kurs_jual || '',
      Kurs_Tengah: item.kurs_tengah || ''
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus data kurs ini?')) {
      await fetch(`http://localhost:5000/api/kurs/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  return (
    <div className="bg-gray-900/80 border border-amber-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-amber-400 font-bold text-lg mb-4">CRUD Kurs</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <input name="Tanggal" type="date" value={form.Tanggal} onChange={handleChange} className="p-2 bg-gray-800 text-white rounded" required />
        <input name="Periode_Perhitungan_LPG" placeholder="Periode Perhitungan LPG" value={form.Periode_Perhitungan_LPG} onChange={handleChange} className="p-2 bg-gray-800 text-white rounded" required />
        <input name="Kurs_Beli" type="number" step="0.01" placeholder="Kurs Beli" value={form.Kurs_Beli} onChange={handleChange} className="p-2 bg-gray-800 text-white rounded" />
        <input name="Kurs_Jual" type="number" step="0.01" placeholder="Kurs Jual" value={form.Kurs_Jual} onChange={handleChange} className="p-2 bg-gray-800 text-white rounded" />
        <input name="Kurs_Tengah" type="number" step="0.01" placeholder="Kurs Tengah" value={form.Kurs_Tengah} onChange={handleChange} className="p-2 bg-gray-800 text-white rounded md:col-span-2" />
        <button type="submit" className="bg-amber-600 text-black px-4 py-2 rounded font-medium hover:bg-amber-700 md:col-span-2">
          {editingId ? 'Update Data' : 'Tambah Data'}
        </button>
      </form>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {data.map(item => (
          <div key={item.id} className="flex justify-between items-center p-2 bg-gray-800/50 rounded text-sm">
            <span>{item.periode_perhitungan_lpg} | Beli: {item.kurs_beli}</span>
            <div>
              <button onClick={() => handleEdit(item)} className="text-blue-400 mr-2 text-xs">Edit</button>
              <button onClick={() => handleDelete(item.id)} className="text-red-400 text-xs">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}