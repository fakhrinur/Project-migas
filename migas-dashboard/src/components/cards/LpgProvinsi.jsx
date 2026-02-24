// src/components/crud/LpgProvinsiCrud.jsx
import { useState, useEffect } from 'react';

export default function LpgProvinsiCrud() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    Tanggal: '',
    Bulan: '',
    Provinsi: '',
    MOR: '',
    Volume: '',
    Kouta: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchData = () => {
    fetch('http://localhost:5000/api/lpg-provinsi')
      .then(res => res.json())
      .then(setData);
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId 
      ? `http://localhost:5000/api/lpg-provinsi/${editingId}`
      : 'http://localhost:5000/api/lpg-provinsi';
    const method = editingId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    setForm({ Tanggal: '', Bulan: '', Provinsi: '', MOR: '', Volume: '', Kouta: '' });
    setEditingId(null);
    fetchData();
  };

  const handleEdit = (item) => {
    setForm({
      Tanggal: item.Tanggal?.split('T')[0] || '',
      Bulan: item.Bulan || '',
      Provinsi: item.Provinsi || '',
      MOR: item.MOR || '',
      Volume: item.Volume || '',
      Kouta: item.kuota || ''
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus data LPG Provinsi ini?')) {
      await fetch(`http://localhost:5000/api/lpg-provinsi/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  return (
    <div className="bg-gray-900/80 border border-amber-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-amber-400 font-bold text-lg mb-4">CRUD LPG per Provinsi</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <input name="Tanggal" type="date" value={form.Tanggal} onChange={handleChange} className="p-2 bg-gray-800 text-white rounded" required />
        <input name="Bulan" placeholder="Bulan" value={form.Bulan} onChange={handleChange} className="p-2 bg-gray-800 text-white rounded" required />
        <input name="Provinsi" placeholder="Provinsi" value={form.Provinsi} onChange={handleChange} className="p-2 bg-gray-800 text-white rounded" required />
        <input name="MOR" placeholder="MOR" value={form.MOR} onChange={handleChange} className="p-2 bg-gray-800 text-white rounded" />
        <input name="Volume" type="number" placeholder="Volume (ton)" value={form.Volume} onChange={handleChange} className="p-2 bg-gray-800 text-white rounded" required />
        <input name="Kouta" type="number" placeholder="Kuota (ton)" value={form.Kouta} onChange={handleChange} className="p-2 bg-gray-800 text-white rounded" />
        <button type="submit" className="bg-amber-600 text-black px-4 py-2 rounded font-medium hover:bg-amber-700 md:col-span-2">
          {editingId ? 'Update Data' : 'Tambah Data'}
        </button>
      </form>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {data.map(item => (
          <div key={item.id} className="flex justify-between items-center p-2 bg-gray-800/50 rounded text-sm">
            <span>{item.Provinsi} | {item.Volume?.toLocaleString()} ton</span>
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