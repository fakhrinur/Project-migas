// src/components/crud/LpgNasionalCrud.jsx
import { useState, useEffect } from 'react';

export default function LpgNasionalCrud() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    Tanggal: '',
    Bulan: '',
    Volume: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchData = () => {
    fetch('http://localhost:5000/api/lpg-nasional')
      .then(res => res.json())
      .then(json => Array.isArray(json) ? setData(json) : setData([]))
      .catch(err => {
        console.error('Error LPG Nasional:', err);
        setData([]);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'Volume') {
      const sanitized = value.replace(/[^0-9.]/g, '');
      setForm(prev => ({ ...prev, [name]: sanitized }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.Tanggal || !form.Bulan || form.Volume === '') {
      alert('❌ Tanggal, Bulan, dan Volume wajib diisi!');
      return;
    }

    const payload = {
      Tanggal: form.Tanggal,
      Bulan: form.Bulan,
      Volume: parseFloat(form.Volume)
    };

    const url = editingId 
      ? `http://localhost:5000/api/lpg-nasional/${editingId}` 
      : 'http://localhost:5000/api/lpg-nasional';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingId ? '✅ Data LPG Nasional berhasil diupdate!' : '✅ Data LPG Nasional berhasil disimpan!');
        setForm({ Tanggal: '', Bulan: '', Volume: '' });
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
      Volume: item.Volume?.toString() || ''
    });
    setEditingId(item.id);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Yakin ingin menghapus data LPG Nasional ini?')) return;
    fetch(`http://localhost:5000/api/lpg-nasional/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('✅ Data LPG Nasional berhasil dihapus!');
        fetchData();
        window.dispatchEvent(new Event('dashboard:refresh'));
      })
      .catch(err => {
        console.error('Delete error:', err);
        alert('❌ Gagal menghapus data');
      });
  };

  return (
    <div className="bg-gray-900/80 border border-blue-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-blue-400 font-bold text-lg mb-4">
        {editingId ? '✏️ Edit Data LPG Nasional' : '📝 Input Data LPG Nasional'}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <input 
          name="Tanggal" 
          type="date" 
          value={form.Tanggal} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none" 
          required 
        />
        <input
          name="Bulan"
          type="text"
          placeholder="Bulan (contoh: Januari)"
          value={form.Bulan}
          onChange={handleChange}
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          required
        />
        <input 
          name="Volume" 
          type="text" 
          placeholder="Volume (KG)" 
          value={form.Volume} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none md:col-span-2" 
          required
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition md:col-span-2"
        >
          {editingId ? '💾 Update Data' : '➕ Tambah Data'}
        </button>
        {editingId && (
          <button 
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ Tanggal: '', Bulan: '', Volume: '' });
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
                {item.Bulan} | Vol: {item.Volume?.toLocaleString('id-ID')} KG
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