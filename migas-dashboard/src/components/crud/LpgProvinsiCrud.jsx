// src/components/crud/LpgProvinsiCrud.jsx
import { useState, useEffect } from 'react';

export default function LpgProvinsiCrud() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    Tanggal: '',
    Bulan: '',
    Propinsi: '',
    MOR: '',
    Volume: '',
    Kuota: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchData = () => {
    fetch('http://localhost:5000/api/lpg-provinsi')
      .then(res => res.json())
      .then(json => Array.isArray(json) ? setData(json) : setData([]))
      .catch(err => {
        console.error('Error LPG Provinsi:', err);
        setData([]);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['Volume', 'Kuota'].includes(name)) {
      const sanitized = value.replace(/[^0-9.]/g, '');
      setForm(prev => ({ ...prev, [name]: sanitized }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.Tanggal || !form.Bulan || !form.Propinsi) {
      alert('❌ Tanggal, Bulan, dan Provinsi wajib diisi!');
      return;
    }

    const payload = {
      Tanggal: form.Tanggal,
      Bulan: form.Bulan,
      Propinsi: form.Propinsi,
      MOR: form.MOR || null,
      Volume: form.Volume ? parseFloat(form.Volume) : null,
      Kuota: form.Kuota ? parseFloat(form.Kuota) : null
    };

    const url = editingId 
      ? `http://localhost:5000/api/lpg-provinsi/${editingId}` 
      : 'http://localhost:5000/api/lpg-provinsi';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingId ? '✅ Data LPG Provinsi berhasil diupdate!' : '✅ Data LPG Provinsi berhasil disimpan!');
        setForm({ Tanggal: '', Bulan: '', Propinsi: '', MOR: '', Volume: '', Kuota: '' });
        setEditingId(null);
        fetchData();
        window.dispatchEvent(new Event('dashboard:refresh'));
      } else {
        const err = await response.json();
        alert('❌ Error: ' + (err.error || 'Gagal simpan data'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('❌ Gagal menghubungi server');
    }
  };

  const handleEdit = (item) => {
    setForm({
      Tanggal: item.Tanggal?.split('T')[0] || '',
      Bulan: item.Bulan || '',
      Propinsi: item.Propinsi || '',
      MOR: item.MOR || '',
      Volume: item.Volume?.toString() || '',
      Kuota: item.Kuota?.toString() || ''
    });
    setEditingId(item.id);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Yakin ingin menghapus data LPG Provinsi ini?')) return;
    fetch(`http://localhost:5000/api/lpg-provinsi/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('✅ Data LPG Provinsi berhasil dihapus!');
        fetchData();
        window.dispatchEvent(new Event('dashboard:refresh'));
      })
      .catch(err => {
        console.error('Delete error:', err);
        alert('❌ Gagal menghapus data');
      });
  };

  return (
    <div className="bg-gray-900/80 border border-purple-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-purple-400 font-bold text-lg mb-4">
        {editingId ? '✏️ Edit Data LPG Provinsi' : '📝 Input Data LPG Provinsi'}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <input 
          name="Tanggal" 
          type="date" 
          value={form.Tanggal} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 focus:outline-none" 
          required 
        />
        <input
          name="Bulan"
          type="text"
          placeholder="Bulan (contoh: Januari)"
          value={form.Bulan}
          onChange={handleChange}
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 focus:outline-none"
          required
        />
        <input 
          name="Propinsi" 
          type="text" 
          placeholder="Provinsi" 
          value={form.Propinsi} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 focus:outline-none" 
          required
        />
        <input 
          name="MOR" 
          type="text" 
          placeholder="MOR (opsional)" 
          value={form.MOR} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 focus:outline-none" 
        />
        <input 
          name="Volume" 
          type="text" 
          placeholder="Volume (KG)" 
          value={form.Volume} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 focus:outline-none" 
        />
        <input 
          name="Kuota" 
          type="text" 
          placeholder="Kuota (KG)" 
          value={form.Kuota} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 focus:outline-none" 
        />
        <button 
          type="submit" 
          className="bg-purple-600 text-white px-4 py-2 rounded font-medium hover:bg-purple-700 transition md:col-span-2"
        >
          {editingId ? '💾 Update Data' : '➕ Simpan Data'}
        </button>
        {editingId && (
          <button 
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ Tanggal: '', Bulan: '', Propinsi: '', MOR: '', Volume: '', Kuota: '' });
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded font-medium hover:bg-gray-700 transition md:col-span-2"
          >
            ✖️ Batal Edit
          </button>
        )}
      </form>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {data.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada data</p>
        ) : (
          data.map(item => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-gray-800/50 rounded text-sm hover:bg-gray-800/70 transition">
              <span className="text-gray-200">
                {item.Propinsi} | {item.Bulan} | Vol: {item.Volume?.toLocaleString('id-ID')}
              </span>
              <div>
                <button 
                  onClick={() => handleEdit(item)} 
                  className="text-blue-400 hover:text-blue-300 mr-2 text-xs"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}