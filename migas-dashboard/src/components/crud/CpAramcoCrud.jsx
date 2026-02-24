// src/components/crud/CpAramcoCrud.jsx
import { useState, useEffect } from 'react';

export default function CpAramcoCrud() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    Tanggal: '',
    Bulan: '',
    CPA_C3: '',
    CPA_C4: '',
    HIP_LPG_USD_Per_MT: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchData = () => {
    fetch('http://localhost:5000/api/cp-aramco')
      .then(res => res.json())
      .then(json => Array.isArray(json) ? setData(json) : setData([]))
      .catch(err => {
        console.error('Error CP Aramco:', err);
        setData([]);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
  const { name, value } = e.target;
  
  if (['CPA_C3', 'CPA_C4'].includes(name)) {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setForm(prev => {
      const newC3 = name === 'CPA_C3' ? sanitized : prev.CPA_C3;
      const newC4 = name === 'CPA_C4' ? sanitized : prev.CPA_C4;

      // Hitung HIP LPG hanya jika kedua nilai valid
      let hipLpg = '';
      if (newC3 !== '' && newC4 !== '') {
        const c3 = parseFloat(newC3);
        const c4 = parseFloat(newC4);
        if (!isNaN(c3) && !isNaN(c4)) {
          hipLpg = ((c3 * 0.5) + (c4 * 0.5)).toFixed(2);
        }
      }

      return {
        ...prev,
        [name]: sanitized,
        HIP_LPG_USD_Per_MT: hipLpg
      };
    });
  } else {
    setForm(prev => ({ ...prev, [name]: value }));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      Tanggal: form.Tanggal,
      Bulan: form.Bulan,
      CPA_C3: form.CPA_C3 ? parseFloat(form.CPA_C3) : null,
      CPA_C4: form.CPA_C4 ? parseFloat(form.CPA_C4) : null,
      HIP_LPG_USD_Per_MT: form.HIP_LPG_USD_Per_MT ? parseFloat(form.HIP_LPG_USD_Per_MT) : null
    };

    const url = editingId 
      ? `http://localhost:5000/api/cp-aramco/${editingId}` 
      : 'http://localhost:5000/api/cp-aramco';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingId ? '✅ Data CP Aramco berhasil diupdate!' : '✅ Data CP Aramco berhasil disimpan!');
        setForm({ Tanggal: '', Bulan: '', CPA_C3: '', CPA_C4: '', HIP_LPG_USD_Per_MT: '' });
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
      CPA_C3: item.CPA_C3?.toString() || '',
      CPA_C4: item.CPA_C4?.toString() || '',
      HIP_LPG_USD_Per_MT: item.hip_lpg?.toString() || ''
    });
    setEditingId(item.id);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Yakin ingin menghapus data CP Aramco ini?')) return;
    fetch(`http://localhost:5000/api/cp-aramco/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('✅ Data CP Aramco berhasil dihapus!');
        fetchData();
        window.dispatchEvent(new Event('dashboard:refresh'));
      })
      .catch(err => {
        console.error('Delete error:', err);
        alert('❌ Gagal menghapus data');
      });
  };

  return (
    <div className="bg-gray-900/80 border border-yellow-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-yellow-400 font-bold text-lg mb-4">
        {editingId ? '✏️ Edit Data CP Aramco' : '📝 Input Data CP Aramco'}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <input 
          name="Tanggal" 
          type="date" 
          value={form.Tanggal} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-yellow-500 focus:outline-none" 
          required 
        />
        <input
          name="Bulan"
          type="text"
          placeholder="Bulan (contoh: Januari)"
          value={form.Bulan}
          onChange={handleChange}
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-yellow-500 focus:outline-none"
          required
        />
        <input 
          name="CPA_C3" 
          type="text" 
          placeholder="CPA C3" 
          value={form.CPA_C3} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-yellow-500 focus:outline-none" 
        />
        <input 
          name="CPA_C4" 
          type="text" 
          placeholder="CPA C4" 
          value={form.CPA_C4} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-yellow-500 focus:outline-none" 
        />
        <input 
          name="HIP_LPG_USD_Per_MT" 
          type="text" 
          placeholder="HIP LPG (USD/MT)" 
          value={form.HIP_LPG_USD_Per_MT} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-yellow-500 focus:outline-none md:col-span-2" 
        />
        <button 
          type="submit" 
          className="bg-yellow-600 text-black px-4 py-2 rounded font-medium hover:bg-yellow-700 transition md:col-span-2"
        >
          {editingId ? '💾 Update Data' : '➕ Tambah Data'}
        </button>
        {editingId && (
          <button 
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ Tanggal: '', Bulan: '', CPA_C3: '', CPA_C4: '', HIP_LPG_USD_Per_MT: '' });
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
                {item.Bulan} | C3: {item.CPA_C3?.toLocaleString('id-ID')} | C4: {item.CPA_C4?.toLocaleString('id-ID')}
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