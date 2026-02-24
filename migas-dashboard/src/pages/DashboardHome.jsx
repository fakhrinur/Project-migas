// src/pages/DashboardHome.jsx - Fixed: Chart Data Properly Updated
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === "") return "-";
  const num = parseFloat(value);
  if (isNaN(num)) return "-";
  return num.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

function DashboardHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('beranda');
  const [cpAramcoList, setCpAramcoList] = useState([]);
  const [kursList, setKursList] = useState([]);
  const [lpgNasionalList, setLpgNasionalList] = useState([]);
  const [lpgProvinsiList, setLpgProvinsiList] = useState([]);
  const [simulasiLpgList, setSimulasiLpgList] = useState([]);
  const [simulasiPage, setSimulasiPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Chart states
  const [chartDataKurs, setChartDataKurs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartDataLpgNasional, setChartDataLpgNasional] = useState([]);
  const [chartDataLpgProvinsiAll, setChartDataLpgProvinsiAll] = useState([]);
  const [chartDataSimulasi, setChartDataSimulasi] = useState([]);
  const [top3Provinces, setTop3Provinces] = useState([]);

  const rowsPerPage = 10;
  const totalSimulasiPages = Math.ceil(simulasiLpgList.length / rowsPerPage);
  const currentSimulasiData = simulasiLpgList.slice(
    (simulasiPage - 1) * rowsPerPage,
    simulasiPage * rowsPerPage
  );

  const fetchData = async () => {
    try {
      setError(null);
      const [cpRes, kursRes, lpgNasRes, lpgProvRes, simulasiRes] = await Promise.all([
        fetch("http://localhost:5000/api/cp-aramco"),
        fetch("http://localhost:5000/api/kurs"),
        fetch("http://localhost:5000/api/lpg-nasional"),
        fetch("http://localhost:5000/api/lpg-provinsi"),
        fetch("http://localhost:5000/api/simulasi-lpg-3kg"),
      ]);

      const cpData = await cpRes.json();
      const kursData = await kursRes.json();
      const lpgNasData = await lpgNasRes.json();
      const lpgProvData = await lpgProvRes.json();
      const simulasiData = await simulasiRes.json();

      const allCpData = (Array.isArray(cpData) ? cpData : []).sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal));
      const allKursData = (Array.isArray(kursData) ? kursData : []).sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal));
      const allLpgNasData = (Array.isArray(lpgNasData) ? lpgNasData : []).sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal));
      const allLpgProvData = (Array.isArray(lpgProvData) ? lpgProvData : []).sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal));
      const allSimulasiData = (Array.isArray(simulasiData) ? simulasiData : []).sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal));

      const last12MonthsCp = allCpData.slice(0, 12);
      const last12MonthsKurs = allKursData.slice(0, 12);
      const last12MonthsLpgNas = allLpgNasData.slice(0, 12);
      const last12MonthsLpgProv = allLpgProvData.slice(0, 12);

      setCpAramcoList(last12MonthsCp);
      setKursList(last12MonthsKurs);
      setLpgNasionalList(last12MonthsLpgNas);
      setLpgProvinsiList(last12MonthsLpgProv);
      setSimulasiLpgList(allSimulasiData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("❌ Error fetching ", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    const handleRefresh = () => fetchData();
    window.addEventListener("dashboard:refresh", handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("dashboard:refresh", handleRefresh);
    };
  }, []);

  // ✅ EFFECT UNTUK MEMPROSES SEMUA CHART DATA SECARA REAKTIF
  useEffect(() => {
    // ✅ CP ARAMCO CHART
    const newChartData = [...cpAramcoList]
      .sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal))
      .slice(-12)
      .map(item => {
        const formatTanggal = formatDate(item.Tanggal);
        return {
          tanggal: formatTanggal,
          bulanAsli: item.Bulan,
          C3: parseFloat(item.CPA_C3) || 0,
          C4: parseFloat(item.CPA_C4) || 0,
          HIP: parseFloat(item.hip_lpg) || 0,
        };
      });
    setChartData(newChartData);

    // Kurs Chart
    const newChartDataKurs = [...kursList]
      .sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal))
      .slice(-12)
      .map(item => {
        const formatTanggal = formatDate(item.Tanggal);
        return {
          tanggalPost: formatTanggal,
          kursBeli: parseFloat(item.kurs_beli) || 0,
          kursJual: parseFloat(item.kurs_jual) || 0,
          kursTengah: parseFloat(item.kurs_tengah) || 0,
          periodeAsli: item.periode_perhitungan_lpg
        };
      });
    setChartDataKurs(newChartDataKurs);

    // LPG Nasional Chart
    const newChartDataLpgNasional = [...lpgNasionalList]
      .sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal))
      .slice(-12)
      .map(item => {
        const formatTanggal = formatDate(item.Tanggal);
        return {
          tanggal: formatTanggal,
          bulanAsli: item.Bulan,
          volume: parseFloat(item.Volume) || 0,
        };
      });
    setChartDataLpgNasional(newChartDataLpgNasional);

    // ✅ LPG PROVINSI CHART - DIPERBAIKI
    const groupedLpgProvData = lpgProvinsiList.reduce((acc, item) => {
      const prov = item.Propinsi;
      if (!acc[prov]) acc[prov] = [];
      acc[prov].push(item);
      return acc;
    }, {});

    const newTop3Provinces = Object.keys(groupedLpgProvData).slice(0, 3);
    setTop3Provinces(newTop3Provinces);

    // Ambil semua entri tanggal unik dan valid, urutkan berdasarkan Date asli
    const dateEntries = lpgProvinsiList
      .map(item => {
        const date = new Date(item.Tanggal);
        const formatted = formatDate(item.Tanggal);
        return { date, formatted };
      })
      .filter(entry => entry.formatted !== "-");

    // Hapus duplikat berdasarkan formatted date, urutkan berdasarkan date asli
    const uniqueEntries = Array.from(
      new Map(dateEntries.map(entry => [entry.formatted, entry])).values()
    ).sort((a, b) => a.date - b.date);

    const allTanggal = uniqueEntries.map(entry => entry.formatted);

    const newChartDataLpgProvinsiAll = allTanggal.map(tanggalFormatted => {
      const row = { tanggal: tanggalFormatted };
      newTop3Provinces.forEach(prov => {
        const item = groupedLpgProvData[prov]?.find(d => {
          return formatDate(d.Tanggal) === tanggalFormatted;
        });
        row[`${prov}_volume`] = item ? parseFloat(item.Volume) || 0 : 0;
        row[`${prov}_kuota`] = item ? parseFloat(item.Kuota) || 0 : 0;
      });
      return row;
    });

    setChartDataLpgProvinsiAll(newChartDataLpgProvinsiAll);

    // Simulasi Chart
    const newChartDataSimulasi = [...simulasiLpgList]
      .sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal))
      .map(item => {
        const shortDate = formatDate(item.Tanggal);
        return {
          tanggal: shortDate,
          hipKg: parseFloat(item.HIP_LPG_Per_Kg) || 0,
          hargaJualEceran: parseFloat(item.HargaJualEceran) || 0,
          hargaJualPerhitunganRp: parseFloat(item.Harga_Jual_Perhitungan_Rp_Kg) || 0,
        };
      });
    setChartDataSimulasi(newChartDataSimulasi);
  }, [cpAramcoList, kursList, lpgNasionalList, lpgProvinsiList, simulasiLpgList]);

  // === Sisa fungsi (handleEdit, handleDelete, CustomTooltip, dll) tetap sama ===
  const handleEdit = (item, type) => {
    const id = item.id;
    if (!id) {
      alert("Data ini tidak memiliki ID, tidak bisa diedit.");
      return;
    }
    const routes = {
      cpAramco: `/dashboard/cp-aramco/edit/${id}`,
      kurs: `/dashboard/kurs-data/edit/${id}`,
      lpgNasional: `/dashboard/lpg-nasional/edit/${id}`,
      lpgProvinsi: `/dashboard/lpg-provinsi/edit/${id}`
    };
    navigate(routes[type]);
  };

  const handleDelete = async (id, type) => {
    if (!id || !window.confirm(`Yakin ingin menghapus data ${type}?`)) return;
    const apiEndpoints = {
      cpAramco: 'http://localhost:5000/api/cp-aramco',
      kurs: 'http://localhost:5000/api/kurs',
      lpgNasional: 'http://localhost:5000/api/lpg-nasional',
      lpgProvinsi: 'http://localhost:5000/api/lpg-provinsi'
    };
    try {
      const res = await fetch(`${apiEndpoints[type]}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert(`✅ Data berhasil dihapus`);
        fetchData();
      } else {
        alert(`❌ Gagal menghapus data.`);
      }
    } catch (error) {
      console.error('Error hapus:', error);
      alert('❌ Terjadi kesalahan jaringan.');
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/95 border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-gray-300 font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: <span className="font-bold">{formatNumber(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // === UI Render (tidak diubah sama sekali) ===
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
        <p className="mt-6 text-gray-400 font-medium">Memuat data dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/50 rounded-2xl p-8 text-center backdrop-blur-sm">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-red-300 text-lg mb-4">Gagal memuat data</p>
        <p className="text-red-400 text-sm mb-6">{error}</p>
        <button onClick={fetchData} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg">
          🔄 Coba Lagi
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'beranda', label: ' Beranda' },
    { id: 'cpAramco', label: ' CP Aramco' },
    { id: 'kurs', label: ' Kurs'},
    { id: 'lpgNasional', label: ' LPG Nasional' },
    { id: 'lpgProvinsi', label: ' LPG Provinsi' }
  ];

  return (
    <div className="text-gray-100 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-pink-900/40 rounded-2xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
               Dashboard Migas
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Monitoring data sistem secara real-time</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Live</span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Update: {lastUpdate?.toLocaleTimeString("id-ID")}
            </div>
          </div>
        </div>
        {/* Tab Menu */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* === Content Based on Active Tab === */}
      {activeTab === 'beranda' && (
        <div className="space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 rounded-xl p-6 border border-pink-500/30 backdrop-blur-sm transform hover:scale-105 transition-transform cursor-pointer" onClick={() => setActiveTab('cpAramco')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">CP Aramco</p>
                  <p className="text-3xl font-bold text-pink-300 mt-2">{cpAramcoList.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Data Terbaru</p>
                </div>
                <div className="w-14 h-14 bg-pink-500/20 rounded-full flex items-center justify-center text-2xl">📊</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 rounded-xl p-6 border border-yellow-500/30 backdrop-blur-sm transform hover:scale-105 transition-transform cursor-pointer" onClick={() => setActiveTab('kurs')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Kurs</p>
                  <p className="text-3xl font-bold text-yellow-300 mt-2">{kursList.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Data Terbaru</p>
                </div>
                <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center text-2xl">💰</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-6 border border-blue-500/30 backdrop-blur-sm transform hover:scale-105 transition-transform cursor-pointer" onClick={() => setActiveTab('lpgNasional')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">LPG Nasional</p>
                  <p className="text-3xl font-bold text-blue-300 mt-2">{lpgNasionalList.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Data Terbaru</p>
                </div>
                <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl">🏭</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-6 border border-green-500/30 backdrop-blur-sm transform hover:scale-105 transition-transform cursor-pointer" onClick={() => setActiveTab('lpgProvinsi')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">LPG Provinsi</p>
                  <p className="text-3xl font-bold text-green-300 mt-2">{lpgProvinsiList.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Data Terbaru</p>
                </div>
                <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center text-2xl">📚</div>
              </div>
            </div>
          </div>

          {/* 📈 LINE CHART - SIMULASI LPG 3KG */}
          {simulasiLpgList.length > 0 && chartDataSimulasi.length > 0 && (
            <div className="mb-6 bg-gradient-to-br from-indigo-900/40 to-violet-900/40 rounded-2xl p-6 backdrop-blur-sm border border-indigo-500/30 shadow-xl">
              <h3 className="text-lg font-semibold text-indigo-200 mb-4 flex items-center gap-2">
                <span>📈</span>
                Trend Simulasi LPG 3KG (HIP/Kg, Harga Jual Eceran, Harga Jual Perhitungan Rp)
              </h3>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <LineChart data={chartDataSimulasi} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="tanggal" 
                      stroke="#9CA3AF"
                      style={{ fontSize: '10px' }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={100}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hipKg" 
                      stroke="#fbbf24" 
                      strokeWidth={2}
                      dot={{ fill: '#fbbf24', r: 3 }}
                      activeDot={{ r: 5 }}
                      name="HIP/Kg"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hargaJualEceran" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Harga Jual Eceran"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hargaJualPerhitunganRp" 
                      stroke="#ec4899" 
                      strokeWidth={2}
                      dot={{ fill: '#ec4899', r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Harga Jual Perhitungan Rp"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tabel Simulasi LPG 3KG */}
          <div className="bg-gradient-to-br from-indigo-900/30 to-violet-900/30 rounded-2xl p-6 backdrop-blur-sm border border-indigo-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-2xl">📈</div>
                <div>
                  <h2 className="text-2xl font-bold text-indigo-300">Simulasi LPG 3KG</h2>
                  <p className="text-sm text-gray-400">{simulasiLpgList.length} Data Terbaru</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={simulasiPage === 1}
                  onClick={() => setSimulasiPage(simulasiPage - 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    simulasiPage === 1
                      ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  ⬅ Previous
                </button>
                <span className="text-gray-300">
                  Page {simulasiPage} / {totalSimulasiPages}
                </span>
                <button
                  disabled={simulasiPage === totalSimulasiPages}
                  onClick={() => setSimulasiPage(simulasiPage + 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    simulasiPage === totalSimulasiPages
                      ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  Next ➡
                </button>
              </div>
            </div>
            {simulasiLpgList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/80 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">Tanggal</th>
                      <th className="px-4 py-3 text-left text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">Bulan</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">CPA C3</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">CPA C4</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">HIP (USD/MT)</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">Rata² Kurs</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">HIP/Kg</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">Harga Patokan</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">Harga Jual Tanpa Margin</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">Harga Jual Eceran</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">Margin</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">PPN</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">Subsidi</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">Periode Perhitungan kg</th>
                      <th className="px-4 py-3 text-right text-indigo-300 font-semibold border-b border-gray-700 whitespace-nowrap">Harga Jual RP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSimulasiData.map((item, index) => (
                      <tr 
                        key={index}
                        className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{formatDate(item.Tanggal)}</td>
                        <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{item.Bulan || "-"}</td>
                        <td className="px-4 py-3 text-right text-pink-300 font-medium whitespace-nowrap">{formatNumber(item.CPA_C3)}</td>
                        <td className="px-4 py-3 text-right text-purple-300 font-medium whitespace-nowrap">{formatNumber(item.CPA_C4)}</td>
                        <td className="px-4 py-3 text-right text-yellow-300 font-medium whitespace-nowrap">{formatNumber(item.HIP_LPG_USD_Per_MT)}</td>
                        <td className="px-4 py-3 text-right text-orange-300 font-medium whitespace-nowrap">{formatNumber(item.Rata_Rata_Kurs, 0)}</td>
                        <td className="px-4 py-3 text-right text-blue-300 font-medium whitespace-nowrap">{formatNumber(item.HIP_LPG_Per_Kg)}</td>
                        <td className="px-4 py-3 text-right text-green-300 font-medium whitespace-nowrap">{formatNumber(item.Harga_Patokan_Rp_Kg)}</td>
                        <td className="px-4 py-3 text-right text-indigo-300 font-medium whitespace-nowrap">{formatNumber(item.HargaJualTanpaMarginPlusPPN)}</td>
                        <td className="px-4 py-3 text-right text-lime-300 font-medium whitespace-nowrap">{formatNumber(item.HargaJualEceran)}</td>
                        <td className="px-4 py-3 text-right text-cyan-300 font-medium whitespace-nowrap">{formatNumber(item.Margin)}</td>
                        <td className="px-4 py-3 text-right text-purple-300 font-medium whitespace-nowrap">{formatNumber(item.PPN)}</td>
                        <td className="px-4 py-3 text-right text-emerald-300 font-bold whitespace-nowrap">{formatNumber(item.Subsidi)}</td>
                        <td className="px-4 py-3 text-right text-gray-300 whitespace-nowrap">{item.Periode_Perhitungan_LPG || "-"}</td>
                        <td className="px-4 py-3 text-right text-rose-300 font-bold whitespace-nowrap">{formatNumber(item.Harga_Jual_Perhitungan_Rp_Kg)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4"> telemetry</div>
                <p className="text-lg font-medium">Belum ada data Simulasi LPG 3KG</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === Sisa tab (cpAramco, kurs, lpgNasional, lpgProvinsi) tetap persis seperti file asli === */}
      {activeTab === 'cpAramco' && (
        <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-2xl p-6 backdrop-blur-sm border border-pink-500/30 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-2xl">📊</div>
            <div>
              <h2 className="text-2xl font-bold text-pink-300">CP Aramco</h2>
              <p className="text-sm text-gray-400">12 Data Terbaru</p>
            </div>
          </div>
          {cpAramcoList.length > 0 && chartData.length > 0 && (
            <div className="mb-6 bg-gray-800/50 rounded-xl p-6 border border-pink-500/20">
              <h3 className="text-lg font-semibold text-pink-200 mb-4 flex items-center gap-2">
                <span>📈</span>
                Trend CP Aramco (12 Data Terbaru - Berdasarkan Tanggal Input)
              </h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="tanggal"
                      stroke="#9CA3AF"
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="C3" 
                      stroke="#ec4899" 
                      strokeWidth={2}
                      dot={{ fill: '#ec4899', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="CPA C3"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="C4" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={{ fill: '#a855f7', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="CPA C4"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="HIP" 
                      stroke="#fbbf24" 
                      strokeWidth={2}
                      dot={{ fill: '#fbbf24', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="HIP LPG"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {cpAramcoList.length > 0 ? (
            <div className="space-y-3">
              {cpAramcoList.map((item, index) => (
                <div key={item.id} className="group/item bg-gray-800/50 hover:bg-gray-800/80 rounded-xl p-4 transition-all duration-200 border border-transparent hover:border-pink-500/30">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-white text-lg">{item.Bulan || "-"}</span>
                        <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 text-xs rounded-md">{formatDate(item.Tanggal)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-900/50 p-3 rounded-lg">
                          <span className="text-gray-500 text-xs">C3</span>
                          <p className="text-pink-300 font-bold text-lg mt-1">{formatNumber(item.CPA_C3)}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg">
                          <span className="text-gray-500 text-xs">C4</span>
                          <p className="text-purple-300 font-bold text-lg mt-1">{formatNumber(item.CPA_C4)}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg">
                          <span className="text-gray-500 text-xs">HIP</span>
                          <p className="text-yellow-300 font-bold text-lg mt-1">{formatNumber(item.hip_lpg)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity ml-4">
                      <button onClick={() => handleEdit(item, 'cpAramco')} className="w-10 h-10 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg transition-colors">✏️</button>
                      <button onClick={() => handleDelete(item.id, 'cpAramco')} className="w-10 h-10 flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4"> telemetry</div>
              <p className="text-lg">Belum ada data CP Aramco</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'kurs' && (
        <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-2xl p-6 backdrop-blur-sm border border-yellow-500/30 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-2xl">💰</div>
            <div>
              <h2 className="text-2xl font-bold text-yellow-300">Kurs</h2>
              <p className="text-sm text-gray-400">12 Data Terbaru</p>
            </div>
          </div>
          {kursList.length > 0 && chartDataKurs.length > 0 && (
            <div className="mb-6 bg-gray-800/50 rounded-xl p-6 border border-yellow-500/20">
              <h3 className="text-lg font-semibold text-yellow-200 mb-4 flex items-center gap-2">
                <span>📈</span>
                Trend Kurs (Beli, Jual, Tengah) - Berdasarkan Tanggal Posting
              </h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartDataKurs} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="tanggalPost"
                      stroke="#9CA3AF"
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="kursBeli" 
                      stroke="#006400" 
                      strokeWidth={2}
                      dot={{ fill: '#eab308', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Kurs Beli"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="kursJual" 
                      stroke="#C71585" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Kurs Jual"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="kursTengah" 
                      stroke="#FF8C00" 
                      strokeWidth={2}
                      dot={{ fill: '#fbbf24', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Kurs Tengah"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {kursList.length > 0 ? (
            <div className="space-y-3">
              {[...kursList]
  .sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal)) // Sort berdasarkan Tanggal
  .map((item) => (
  <div key={item.id} className="group/item bg-gray-800/50 hover:bg-gray-800/80 rounded-xl p-4 transition-all duration-200 border border-transparent hover:border-yellow-500/30">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-white text-lg">{item.periode_perhitungan_lpg || "-"}</span>
          <span className="text-xs text-gray-400">
            (Posted: {formatDate(item.Tanggal)}) {/* Gunakan Tanggal */}
          </span>
        </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-900/50 p-3 rounded-lg">
                          <span className="text-gray-500 text-xs">Beli</span>
                          <p className="text-yellow-300 font-bold text-lg mt-1">{formatNumber(item.kurs_beli, 0)}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg">
                          <span className="text-gray-500 text-xs">Jual</span>
                          <p className="text-orange-300 font-bold text-lg mt-1">{formatNumber(item.kurs_jual, 0)}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg">
                          <span className="text-gray-500 text-xs">Tengah</span>
                          <p className="text-amber-300 font-bold text-lg mt-1">{formatNumber(item.kurs_tengah, 0)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity ml-4">
                      <button onClick={() => handleEdit(item, 'kurs')} className="w-10 h-10 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg transition-colors">✏️</button>
                      <button onClick={() => handleDelete(item.id, 'kurs')} className="w-10 h-10 flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg">Belum ada data Kurs</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lpgNasional' && (
        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 backdrop-blur-sm border border-blue-500/30 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">🏭</div>
            <div>
              <h2 className="text-2xl font-bold text-blue-300">LPG Nasional</h2>
              <p className="text-sm text-gray-400">12 Data Terbaru</p>
            </div>
          </div>
          {lpgNasionalList.length > 0 && chartDataLpgNasional.length > 0 && (
            <div className="mb-6 bg-gray-800/50 rounded-xl p-6 border border-blue-500/20">
              <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                <span>📈</span>
                Trend Volume LPG Nasional (12 Data Terbaru - Berdasarkan Tanggal Input)
              </h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartDataLpgNasional} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="tanggal"
                      stroke="#9CA3AF"
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Volume (KG)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {lpgNasionalList.length > 0 ? (
            <div className="space-y-3">
              {lpgNasionalList.map((item) => (
                <div key={item.id} className="group/item bg-gray-800/50 hover:bg-gray-800/80 rounded-xl p-4 transition-all duration-200 border border-transparent hover:border-blue-500/30">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-bold text-white text-lg">{item.Bulan || "-"}</span>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-md">{formatDate(item.Tanggal)}</span>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-lg">
                        <span className="text-gray-500 text-xs">Volume</span>
                        <p className="text-blue-300 font-bold text-2xl mt-1">{formatNumber(item.Volume, 0)} <span className="text-sm text-gray-400">KG</span></p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity ml-4">
                      <button onClick={() => handleEdit(item, 'lpgNasional')} className="w-10 h-10 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg transition-colors">✏️</button>
                      <button onClick={() => handleDelete(item.id, 'lpgNasional')} className="w-10 h-10 flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4"> telemetry</div>
              <p className="text-lg">Belum ada data LPG Nasional</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lpgProvinsi' && (
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-6 backdrop-blur-sm border border-green-500/30 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl">📚</div>
            <div>
              <h2 className="text-2xl font-bold text-green-300">LPG Provinsi</h2>
              <p className="text-sm text-gray-400">12 Data Terbaru (Top 3 Provinsi)</p>
            </div>
          </div>
          {lpgProvinsiList.length > 0 && chartDataLpgProvinsiAll.length > 0 && (
            <div className="mb-6 bg-gray-800/50 rounded-xl p-6 border border-green-500/20">
              <h3 className="text-lg font-semibold text-green-200 mb-4 flex items-center gap-2">
                <span>📈</span>
                Trend Volume & Kuota LPG (Top 3 Provinsi - Berdasarkan Tanggal Input)
              </h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartDataLpgProvinsiAll} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="tanggal"
                      stroke="#9CA3AF"
                      style={{ fontSize: '10px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    {top3Provinces.map((prov, index) => (
                      <React.Fragment key={prov}>
                        <Line 
                          type="monotone" 
                          dataKey={`${prov}_volume`} 
                          stroke={['#66CDAA', '#2F4F4F', '#8B4513'][index % 3]} 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          name={`${prov} - Volume`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey={`${prov}_kuota`} 
                          stroke={['#0000CD', '#0000CD', '#22c55e'][index % 3]} 
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          name={`${prov} - Kuota`}
                        />
                      </React.Fragment>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {lpgProvinsiList.length > 0 ? (
            <div className="space-y-3">
              {lpgProvinsiList.map((item) => (
                <div key={item.id} className="group/item bg-gray-800/50 hover:bg-gray-800/80 rounded-xl p-4 transition-all duration-200 border border-transparent hover:border-green-500/30">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-bold text-white text-lg">{item.Bulan || "-"}</span>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-md">
                          {formatDate(item.Tanggal)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-900/50 p-3 rounded-lg">
                          <span className="text-gray-500 text-xs">MOR</span>
                          <p className="text-green-300 font-bold text-base mt-1">{item.MOR || "-"}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg">
                          <span className="text-gray-500 text-xs">Volume</span>
                          <p className="text-emerald-300 font-bold text-base mt-1">{formatNumber(item.Volume, 0)}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg">
                          <span className="text-gray-500 text-xs">Kuota</span>
                          <p className="text-teal-300 font-bold text-base mt-1">{formatNumber(item.Kuota, 0)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity ml-4">
                      <button onClick={() => handleEdit(item, 'lpgProvinsi')} className="w-10 h-10 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg transition-colors">✏️</button>
                      <button onClick={() => handleDelete(item.id, 'lpgProvinsi')} className="w-10 h-10 flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg">Belum ada data LPG Provinsi</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardHome;