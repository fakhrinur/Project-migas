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
      .then(json => Array.isArray(json) ? setData(json) : setData([]))
      .catch(err => {
        console.error('Error Kurs:', err);
        setData([]);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (['Kurs_Beli', 'Kurs_Jual'].includes(name)) {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setForm(prev => {
      const newBeli = name === 'Kurs_Beli' ? sanitized : prev.Kurs_Beli;
      const newJual = name === 'Kurs_Jual' ? sanitized : prev.Kurs_Jual;

      // Hitung Kurs Tengah hanya jika kedua nilai valid
      let kursTengah = '';
      if (newBeli !== '' && newJual !== '') {
        const beli = parseFloat(newBeli);
        const jual = parseFloat(newJual);
        if (!isNaN(beli) && !isNaN(jual)) {
          kursTengah = ((beli + jual) / 2).toFixed(2);
        }
      }

      return {
        ...prev,
        [name]: sanitized,
        Kurs_Tengah: kursTengah
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
      Periode_Perhitungan_LPG: form.Periode_Perhitungan_LPG,
      Kurs_Beli: form.Kurs_Beli ? parseFloat(form.Kurs_Beli) : null,
      Kurs_Jual: form.Kurs_Jual ? parseFloat(form.Kurs_Jual) : null,
      Kurs_Tengah: form.Kurs_Tengah ? parseFloat(form.Kurs_Tengah) : null
    };

    const url = editingId 
      ? `http://localhost:5000/api/kurs/${editingId}` 
      : 'http://localhost:5000/api/kurs';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingId ? '✅ Data Kurs berhasil diupdate!' : '✅ Data Kurs berhasil disimpan!');
        setForm({ Tanggal: '', Periode_Perhitungan_LPG: '', Kurs_Beli: '', Kurs_Jual: '', Kurs_Tengah: '' });
        setEditingId(null);
        fetchData();
        // ✅ TRIGGER REFRESH DASHBOARD
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
      Periode_Perhitungan_LPG: item.periode_perhitungan_lpg || '',
      Kurs_Beli: item.kurs_beli?.toString() || '',
      Kurs_Jual: item.kurs_jual?.toString() || '',
      Kurs_Tengah: item.kurs_tengah?.toString() || ''
    });
    setEditingId(item.id);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Yakin ingin menghapus data kurs ini?')) return;
    fetch(`http://localhost:5000/api/kurs/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('✅ Data Kurs berhasil dihapus!');
        fetchData();
        window.dispatchEvent(new Event('dashboard:refresh'));
      })
      .catch(err => {
        console.error('Delete error:', err);
        alert('❌ Gagal menghapus data');
      });
  };

  return (
    <div className="bg-gray-900/80 border border-amber-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-amber-400 font-bold text-lg mb-4">
        {editingId ? '✏️ Edit Data Kurs' : '📝 Input Data Kurs'}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <input 
          name="Tanggal" 
          type="date" 
          value={form.Tanggal} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-amber-500 focus:outline-none" 
          required 
        />
        <input 
          name="Periode_Perhitungan_LPG" 
          placeholder="Periode Perhitungan LPG" 
          value={form.Periode_Perhitungan_LPG} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-amber-500 focus:outline-none" 
          required 
        />
        <input 
          name="Kurs_Beli" 
          type="text" 
          placeholder="Kurs Beli" 
          value={form.Kurs_Beli} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-amber-500 focus:outline-none" 
        />
        <input 
          name="Kurs_Jual" 
          type="text" 
          placeholder="Kurs Jual" 
          value={form.Kurs_Jual} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-amber-500 focus:outline-none" 
        />
        <input 
          name="Kurs_Tengah" 
          type="text" 
          placeholder="Kurs Tengah" 
          value={form.Kurs_Tengah} 
          onChange={handleChange} 
          className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-amber-500 focus:outline-none md:col-span-2" 
        />
        <button 
          type="submit" 
          className="bg-amber-600 text-black px-4 py-2 rounded font-medium hover:bg-amber-700 transition md:col-span-2"
        >
          {editingId ? '💾 Update Data' : '➕ Tambah Data'}
        </button>
        {editingId && (
          <button 
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ Tanggal: '', Periode_Perhitungan_LPG: '', Kurs_Beli: '', Kurs_Jual: '', Kurs_Tengah: '' });
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
                {item.periode_perhitungan_lpg} | Beli: {item.kurs_beli?.toLocaleString('id-ID')}
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