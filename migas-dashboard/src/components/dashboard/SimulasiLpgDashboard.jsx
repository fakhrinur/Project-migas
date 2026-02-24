import React, { useState, useEffect } from 'react';

export default function SimulasiLpgDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/simulasi-lpg')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching simulasi LPG:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-8">⏳ Memuat data...</div>;

  return (
    <div className="bg-gray-900/80 border border-green-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-green-400 font-bold text-lg mb-4">📊 Simulasi Harga LPG 3KG</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="bg-gray-800 text-xs uppercase">
            <tr>
              <th className="px-4 py-2">Tanggal</th>
              <th className="px-4 py-2">Bulan</th>
              <th className="px-4 py-2">CPA C3</th>
              <th className="px-4 py-2">CPA C4</th>
              <th className="px-4 py-2">HIP LPG USD/MT</th>
              <th className="px-4 py-2">Rata-Rata Kurs</th>
              <th className="px-4 py-2">HIP LPG/Kg</th>
              <th className="px-4 py-2">Harga Patokan Rp/Kg</th>
              <th className="px-4 py-2">Harga Jual Eceran</th>
              <th className="px-4 py-2">Margin</th>
              <th className="px-4 py-2">Subsidi</th>
              <th className="px-4 py-2">Periode Perhitungan</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="12" className="px-4 py-4 text-center text-gray-500">
                  Belum ada data simulasi
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="px-4 py-2">{new Date(item.Tanggal).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{item.Bulan}</td>
                  <td className="px-4 py-2">{item.CPA_C3?.toLocaleString()}</td>
                  <td className="px-4 py-2">{item.CPA_C4?.toLocaleString()}</td>
                  <td className="px-4 py-2">{item.HIP_LPG_USD_Per_MT?.toFixed(2)}</td>
                  <td className="px-4 py-2">{item.Rata_Rata_Kurs?.toFixed(2)}</td>
                  <td className="px-4 py-2">{item.HIP_LPG_Per_Kg?.toFixed(2)}</td>
                  <td className="px-4 py-2">{item.Harga_Patokan_Rp_Kg?.toLocaleString()}</td>
                  <td className="px-4 py-2">{item.HargaJualEceran?.toLocaleString()}</td>
                  <td className="px-4 py-2">{item.Margin?.toLocaleString()}</td>
                  <td className="px-4 py-2">{item.Subsidi?.toLocaleString()}</td>
                  <td className="px-4 py-2">{item.Periode_Perhitungan_LPG}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}