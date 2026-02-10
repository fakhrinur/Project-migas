const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Konfigurasi database
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let pool;

async function connectDB() {
  try {
    pool = await sql.connect(config);
    console.log('✅ Terhubung ke WARROOM_DWH');
  } catch (err) {
    console.error('❌ Gagal koneksi ke database:', err);
    process.exit(1);
  }
}

// ✅ HELPER FUNCTION: Bersihkan data dari MSSQL metadata
function cleanData(data) {
  if (Array.isArray(data)) {
    return data.map(item => JSON.parse(JSON.stringify(item)));
  }
  if (data && typeof data === 'object') {
    return JSON.parse(JSON.stringify(data));
  }
  return data;
}


/* ========================================
   CP ARAMCO ENDPOINTS
======================================== */

// GET ALL CP Aramco
app.get('/api/cp-aramco', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        id,
        Tanggal,
        Bulan,
        CPA_C3,
        CPA_C4,
        HIP_LPG_USD_Per_MT AS hip_lpg
      FROM dbo.FactCP_Aramco
      ORDER BY Tanggal DESC
    `);
    
    const cleanedData = cleanData(result.recordset);
    res.json(cleanedData);
  } catch (err) {
    console.error('❌ Error GET All CP Aramco:', err);
    res.status(500).json({ error: 'Gagal mengambil data CP Aramco' });
  }
});

// GET CP Aramco by ID
app.get('/api/cp-aramco/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          id,
          Tanggal,
          Bulan,
          CPA_C3,
          CPA_C4,
          HIP_LPG_USD_Per_MT AS hip_lpg
        FROM dbo.FactCP_Aramco
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Data CP Aramco tidak ditemukan' });
    }
    
    const cleanedData = cleanData(result.recordset[0]);
    res.json(cleanedData);
  } catch (err) {
    console.error('❌ Error GET CP Aramco by ID:', err);
    res.status(500).json({ error: 'Gagal mengambil data CP Aramco' });
  }
});

// POST CP Aramco
app.post('/api/cp-aramco', async (req, res) => {
  const { Tanggal, Bulan, CPA_C3, CPA_C4, HIP_LPG_USD_Per_MT } = req.body;

  if (!Tanggal || !Bulan) {
    return res.status(400).json({ error: 'Tanggal dan Bulan wajib diisi' });
  }

  try {
    await pool.request()
      .input('Tanggal', sql.DateTime, Tanggal)
      .input('Bulan', sql.NVarChar, Bulan)
      .input('CPA_C3', sql.Float, CPA_C3 || null)
      .input('CPA_C4', sql.Float, CPA_C4 || null)
      .input('HIP_LPG_USD_Per_MT', sql.Float, HIP_LPG_USD_Per_MT || null)
      .input('CreatedBy', sql.NVarChar, 'admin')
      .input('CreatedDate', sql.DateTime, new Date())
      .input('LastUpdateBy', sql.NVarChar, 'admin')
      .input('LastUpdateDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO dbo.FactCP_Aramco (
          Tanggal, Bulan, CPA_C3, CPA_C4, HIP_LPG_USD_Per_MT,
          CreatedBy, CreatedDate, LastUpdateBy, LastUpdateDate
        )
        VALUES (
          @Tanggal, @Bulan, @CPA_C3, @CPA_C4, @HIP_LPG_USD_Per_MT,
          @CreatedBy, @CreatedDate, @LastUpdateBy, @LastUpdateDate
        )
      `);
    res.status(201).json({ message: 'Data CP Aramco berhasil disimpan' });
  } catch (err) {
    console.error('❌ Error POST CP Aramco:', err);
    res.status(500).json({ error: 'Gagal menyimpan data CP Aramco' });
  }
});

// PUT CP Aramco
app.put('/api/cp-aramco/:id', async (req, res) => {
  const { id } = req.params;
  const { Tanggal, Bulan, CPA_C3, CPA_C4, HIP_LPG_USD_Per_MT } = req.body;
  
  try {
    await pool.request()
      .input('id', sql.Int, id)
      .input('Tanggal', sql.DateTime, Tanggal)
      .input('Bulan', sql.NVarChar, Bulan)
      .input('CPA_C3', sql.Float, CPA_C3)
      .input('CPA_C4', sql.Float, CPA_C4)
      .input('HIP_LPG_USD_Per_MT', sql.Float, HIP_LPG_USD_Per_MT)
      .input('LastUpdateBy', sql.NVarChar, 'admin')
      .input('LastUpdateDate', sql.DateTime, new Date())
      .query(`
        UPDATE dbo.FactCP_Aramco
        SET 
          Tanggal = @Tanggal,
          Bulan = @Bulan,
          CPA_C3 = @CPA_C3,
          CPA_C4 = @CPA_C4,
          HIP_LPG_USD_Per_MT = @HIP_LPG_USD_Per_MT,
          LastUpdateBy = @LastUpdateBy,
          LastUpdateDate = @LastUpdateDate
        WHERE id = @id
      `);
    res.json({ message: 'Data CP Aramco berhasil diupdate' });
  } catch (err) {
    console.error('❌ Error PUT CP Aramco:', err);
    res.status(500).json({ error: 'Gagal mengupdate data CP Aramco' });
  }
});

// DELETE CP Aramco
app.delete('/api/cp-aramco/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM dbo.FactCP_Aramco WHERE id = @id`);
    res.json({ message: 'Data CP Aramco berhasil dihapus' });
  } catch (err) {
    console.error('❌ Error DELETE CP Aramco:', err);
    res.status(500).json({ error: 'Gagal menghapus data CP Aramco' });
  }
});

/* ========================================
   KURS ENDPOINTS
======================================== */

// GET ALL Kurs
app.get('/api/kurs', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        id,
        Tanggal,
        Periode_Perhitungan_LPG AS periode_perhitungan_lpg,
        Kurs_Beli AS kurs_beli,
        Kurs_Jual AS kurs_jual,
        Kurs_Tengah AS kurs_tengah
      FROM dbo.FactKurs
      ORDER BY Tanggal DESC
    `);
    
    const cleanedData = cleanData(result.recordset);
    res.json(cleanedData);
  } catch (err) {
    console.error('❌ Error GET All Kurs:', err);
    res.status(500).json({ error: 'Gagal mengambil data Kurs' });
  }
});

// GET Kurs by ID
app.get('/api/kurs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          id,
          Tanggal,
          Periode_Perhitungan_LPG AS periode_perhitungan_lpg,
          Kurs_Beli AS kurs_beli,
          Kurs_Jual AS kurs_jual,
          Kurs_Tengah AS kurs_tengah
        FROM dbo.FactKurs
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Data Kurs tidak ditemukan' });
    }
    
    const cleanedData = cleanData(result.recordset[0]);
    res.json(cleanedData);
  } catch (err) {
    console.error('❌ Error GET Kurs by ID:', err);
    res.status(500).json({ error: 'Gagal mengambil data Kurs' });
  }
});

// POST Kurs
app.post('/api/kurs', async (req, res) => {
  const { Tanggal, Periode_Perhitungan_LPG, Kurs_Beli, Kurs_Jual, Kurs_Tengah } = req.body;

  if (!Tanggal || !Periode_Perhitungan_LPG) {
    return res.status(400).json({ error: 'Tanggal dan Periode Perhitungan LPG wajib diisi' });
  }

  try {
    await pool.request()
      .input('Tanggal', sql.DateTime, Tanggal)
      .input('Periode_Perhitungan_LPG', sql.NVarChar, Periode_Perhitungan_LPG)
      .input('Kurs_Beli', sql.Float, Kurs_Beli || null)
      .input('Kurs_Jual', sql.Float, Kurs_Jual || null)
      .input('Kurs_Tengah', sql.Float, Kurs_Tengah || null)
      .input('CreatedBy', sql.NVarChar, 'admin')
      .input('CreatedDate', sql.DateTime, new Date())
      .input('LastUpdateBy', sql.NVarChar, 'admin')
      .input('LastUpdateDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO dbo.FactKurs (
          Tanggal, Periode_Perhitungan_LPG, Kurs_Beli, Kurs_Jual, Kurs_Tengah,
          CreatedBy, CreatedDate, LastUpdateBy, LastUpdateDate
        )
        VALUES (
          @Tanggal, @Periode_Perhitungan_LPG, @Kurs_Beli, @Kurs_Jual, @Kurs_Tengah,
          @CreatedBy, @CreatedDate, @LastUpdateBy, @LastUpdateDate
        )
      `);
    res.status(201).json({ message: 'Data Kurs berhasil disimpan' });
  } catch (err) {
    console.error('❌ Error POST Kurs:', err);
    res.status(500).json({ error: 'Gagal menyimpan data Kurs' });
  }
});

// PUT Kurs
app.put('/api/kurs/:id', async (req, res) => {
  const { id } = req.params;
  const { Tanggal, Periode_Perhitungan_LPG, Kurs_Beli, Kurs_Jual, Kurs_Tengah } = req.body;
  
  try {
    await pool.request()
      .input('id', sql.Int, id)
      .input('Tanggal', sql.DateTime, Tanggal)
      .input('Periode_Perhitungan_LPG', sql.NVarChar, Periode_Perhitungan_LPG)
      .input('Kurs_Beli', sql.Float, Kurs_Beli)
      .input('Kurs_Jual', sql.Float, Kurs_Jual)
      .input('Kurs_Tengah', sql.Float, Kurs_Tengah)
      .input('LastUpdateBy', sql.NVarChar, 'admin')
      .input('LastUpdateDate', sql.DateTime, new Date())
      .query(`
        UPDATE dbo.FactKurs
        SET 
          Tanggal = @Tanggal,
          Periode_Perhitungan_LPG = @Periode_Perhitungan_LPG,
          Kurs_Beli = @Kurs_Beli,
          Kurs_Jual = @Kurs_Jual,
          Kurs_Tengah = @Kurs_Tengah,
          LastUpdateBy = @LastUpdateBy,
          LastUpdateDate = @LastUpdateDate
        WHERE id = @id
      `);
    res.json({ message: 'Data Kurs berhasil diupdate' });
  } catch (err) {
    console.error('❌ Error PUT Kurs:', err);
    res.status(500).json({ error: 'Gagal mengupdate data Kurs' });
  }
});

// DELETE Kurs
app.delete('/api/kurs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM dbo.FactKurs WHERE id = @id`);
    res.json({ message: 'Data Kurs berhasil dihapus' });
  } catch (err) {
    console.error('❌ Error DELETE Kurs:', err);
    res.status(500).json({ error: 'Gagal menghapus data Kurs' });
  }
});

/* ========================================
   LPG NASIONAL ENDPOINTS
======================================== */

// GET ALL LPG Nasional
app.get('/api/lpg-nasional', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        id,
        Tanggal,
        Bulan,
        Volume_LPG3KG_KG AS Volume
      FROM Realisasi_Volume_LPG3KG
      ORDER BY Tanggal DESC
    `);
    
    const cleanedData = cleanData(result.recordset);
    res.json(cleanedData);
  } catch (err) {
    console.error('❌ Error GET All LPG Nasional:', err);
    res.status(500).json({ error: 'Gagal mengambil data LPG Nasional' });
  }
});

// GET LPG Nasional by ID
app.get('/api/lpg-nasional/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          id,
          Tanggal,
          Bulan,
          Volume_LPG3KG_KG AS Volume
        FROM Realisasi_Volume_LPG3KG
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Data LPG Nasional tidak ditemukan' });
    }
    
    const cleanedData = cleanData(result.recordset[0]);
    res.json(cleanedData);
  } catch (err) {
    console.error('❌ Error GET LPG Nasional by ID:', err);
    res.status(500).json({ error: 'Gagal mengambil data LPG Nasional' });
  }
});

// POST LPG Nasional
app.post('/api/lpg-nasional', async (req, res) => {
  const { Tanggal, Bulan, Volume } = req.body;

  if (!Tanggal || !Bulan || Volume === undefined) {
    return res.status(400).json({ error: 'Tanggal, Bulan, dan Volume wajib diisi' });
  }

  try {
    await pool.request()
      .input('Tanggal', sql.DateTime, Tanggal)
      .input('Bulan', sql.NVarChar, Bulan)
      .input('Volume_LPG3KG_KG', sql.Float, Volume)
      .input('CreatedBy', sql.NVarChar, 'admin')
      .input('CreatedDate', sql.DateTime, new Date())
      .input('LastUpdateBy', sql.NVarChar, 'admin')
      .input('LastUpdateDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO Realisasi_Volume_LPG3KG (
          Tanggal, Bulan, Volume_LPG3KG_KG,
          CreatedBy, CreatedDate, LastUpdateBy, LastUpdateDate
        )
        VALUES (
          @Tanggal, @Bulan, @Volume_LPG3KG_KG,
          @CreatedBy, @CreatedDate, @LastUpdateBy, @LastUpdateDate
        )
      `);
    res.status(201).json({ message: 'Data LPG Nasional berhasil disimpan' });
  } catch (err) {
    console.error('❌ Error POST LPG Nasional:', err);
    res.status(500).json({ error: 'Gagal menyimpan data LPG Nasional' });
  }
});

// PUT LPG Nasional
app.put('/api/lpg-nasional/:id', async (req, res) => {
  const { id } = req.params;
  const { Tanggal, Bulan, Volume } = req.body;

  try {
    await pool.request()
      .input('id', sql.Int, id)
      .input('Tanggal', sql.DateTime, Tanggal)
      .input('Bulan', sql.NVarChar, Bulan)
      .input('Volume_LPG3KG_KG', sql.Float, Volume)
      .input('LastUpdateBy', sql.NVarChar, 'admin')
      .input('LastUpdateDate', sql.DateTime, new Date())
      .query(`
        UPDATE Realisasi_Volume_LPG3KG
        SET 
          Tanggal = @Tanggal,
          Bulan = @Bulan,
          Volume_LPG3KG_KG = @Volume_LPG3KG_KG,
          LastUpdateBy = @LastUpdateBy,
          LastUpdateDate = @LastUpdateDate
        WHERE id = @id
      `);

    res.json({ message: 'Data LPG Nasional berhasil diupdate' });
  } catch (err) {
    console.error('❌ Error PUT LPG Nasional:', err);
    res.status(500).json({ error: 'Gagal mengupdate LPG Nasional' });
  }
});

// DELETE LPG Nasional
app.delete('/api/lpg-nasional/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM Realisasi_Volume_LPG3KG WHERE id = @id`);
    res.json({ message: 'Data LPG Nasional berhasil dihapus' });
  } catch (err) {
    console.error('❌ Error DELETE LPG Nasional:', err);
    res.status(500).json({ error: 'Gagal menghapus data LPG Nasional' });
  }
});

/* ========================================
   LPG PROVINSI ENDPOINTS
======================================== */

// GET ALL LPG Provinsi
app.get('/api/lpg-provinsi', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        id,
        Tanggal,
        Bulan,
        Propinsi,
        MOR,
        Volume,
        Kuota
      FROM dbo.Volume_LPG3KG_Propinsi
      ORDER BY Tanggal DESC
    `);
    
    const cleanedData = cleanData(result.recordset);
    res.json(cleanedData);
  } catch (err) {
    console.error('❌ Error GET All LPG Provinsi:', err);
    res.status(500).json({ error: 'Gagal mengambil data LPG Provinsi' });
  }
});

// GET LPG Provinsi by ID
app.get('/api/lpg-provinsi/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          id,
          Tanggal,
          Bulan,
          Propinsi,
          MOR,
          Volume,
          Kuota
        FROM dbo.Volume_LPG3KG_Propinsi
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Data LPG Provinsi tidak ditemukan' });
    }
    
    const cleanedData = cleanData(result.recordset[0]);
    res.json(cleanedData);
  } catch (err) {
    console.error('❌ Error GET LPG Provinsi by ID:', err);
    res.status(500).json({ error: 'Gagal mengambil data LPG Provinsi' });
  }
});

// POST LPG Provinsi
app.post('/api/lpg-provinsi', async (req, res) => {
  const { Tanggal, Bulan, Propinsi, MOR, Volume, Kuota } = req.body;

  if (!Tanggal || !Bulan || !Propinsi) {
    return res.status(400).json({ error: 'Tanggal, Bulan, dan Propinsi wajib diisi' });
  }

  try {
    await pool.request()
      .input('Tanggal', sql.DateTime, Tanggal)
      .input('Bulan', sql.NVarChar, Bulan)
      .input('Propinsi', sql.NVarChar, Propinsi)
      .input('MOR', sql.NVarChar, MOR || null)
      .input('Volume', sql.Float, Volume || null)
      .input('Kuota', sql.Float, Kuota || null)
      .input('CreatedBy', sql.NVarChar, 'admin')
      .input('CreatedDate', sql.DateTime, new Date())
      .input('LastUpdateBy', sql.NVarChar, 'admin')
      .input('LastUpdateDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO dbo.Volume_LPG3KG_Propinsi (
          Tanggal, Bulan, Propinsi, MOR, Volume, Kuota,
          CreatedBy, CreatedDate, LastUpdateBy, LastUpdateDate
        )
        VALUES (
          @Tanggal, @Bulan, @Propinsi, @MOR, @Volume, @Kuota,
          @CreatedBy, @CreatedDate, @LastUpdateBy, @LastUpdateDate
        )
      `);
    res.status(201).json({ message: 'Data LPG Provinsi berhasil disimpan' });
  } catch (err) {
    console.error('❌ Error POST LPG Provinsi:', err);
    res.status(500).json({ error: 'Gagal menyimpan data LPG Provinsi' });
  }
});

// PUT LPG Provinsi
app.put('/api/lpg-provinsi/:id', async (req, res) => {
  const { id } = req.params;
  const { Tanggal, Bulan, Propinsi, MOR, Volume, Kuota } = req.body;

  try {
    await pool.request()
      .input('id', sql.Int, id)
      .input('Tanggal', sql.DateTime, Tanggal)
      .input('Bulan', sql.NVarChar, Bulan)
      .input('Propinsi', sql.NVarChar, Propinsi)
      .input('MOR', sql.NVarChar, MOR || null)
      .input('Volume', sql.Float, Volume)
      .input('Kuota', sql.Float, Kuota)
      .input('LastUpdateBy', sql.NVarChar, 'admin')
      .input('LastUpdateDate', sql.DateTime, new Date())
      .query(`
        UPDATE dbo.Volume_LPG3KG_Propinsi
        SET 
          Tanggal = @Tanggal,
          Bulan = @Bulan,
          Propinsi = @Propinsi,
          MOR = @MOR,
          Volume = @Volume,
          Kuota = @Kuota,
          LastUpdateBy = @LastUpdateBy,
          LastUpdateDate = @LastUpdateDate
        WHERE id = @id
      `);

    res.json({ message: 'Data LPG Provinsi berhasil diupdate' });
  } catch (err) {
    console.error('❌ Error PUT LPG Provinsi:', err);
    res.status(500).json({ error: 'Gagal mengupdate LPG Provinsi' });
  }
});

// DELETE LPG Provinsi
app.delete('/api/lpg-provinsi/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM dbo.Volume_LPG3KG_Propinsi WHERE id = @id`);
    res.json({ message: 'Data LPG per Provinsi berhasil dihapus' });
  } catch (err) {
    console.error('❌ Error DELETE LPG Provinsi:', err);
    res.status(500).json({ error: 'Gagal menghapus data LPG per Provinsi' });
  }
});

/* ========================================
   VIEW SIMULASI LPG 3KG ENDPOINT
======================================== */


// GET data dari view vSimulasi_LPG_3KG_Oke 
app.get('/api/simulasi-lpg-3kg', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        Tanggal,
        Bulan,
        CPA_C3,
        CPA_C4,
        HIP_LPG_USD_Per_MT,
        Rata_Rata_Kurs,
        HIP_LPG_Per_Kg,
        Harga_Patokan_Rp_Kg,
        HargaJualEceran,
        Margin,
        HargaJualTanpaMarginPlusPPN,
        PPN,
        Subsidi,
        Periode_Perhitungan_LPG,
        Harga_Jual_Perhitungan_Rp_Kg
      FROM [WARROOM_DWH].[dbo].[vSimulasi_LPG_3KG_Oke]
      ORDER BY Tanggal DESC
    `);

    console.log(`✔ Simulasi LPG 3KG: ${result.recordset.length} data`);
    res.json(cleanData(result.recordset));
  } catch (err) {
    console.error("❌ Error Simulasi LPG 3KG:", err.message);
    res.status(500).json({
      error: "Gagal mengambil data Simulasi LPG 3KG",
      detail: err.message
    });
  }
});
// ✅ ENDPOINT LOGIN
// ✅ ENDPOINT LOGIN
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query(`
        SELECT id, username, password
        FROM dbo.Users 
        WHERE username = @username
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const user = result.recordset[0];

    // 🔐 Jika password disimpan plain text (untuk testing)
    if (password !== user.password) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // ✅ Login berhasil
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      }
    });
  } catch (err) {
    console.error('Error login:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});


/* ========================================
   START SERVER
======================================== */
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Backend jalan di http://localhost:${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   - CP Aramco: http://localhost:${PORT}/api/cp-aramco`);
    console.log(`   - Kurs: http://localhost:${PORT}/api/kurs`);
    console.log(`   - LPG Nasional: http://localhost:${PORT}/api/lpg-nasional`);
    console.log(`   - LPG Provinsi: http://localhost:${PORT}/api/lpg-provinsi`);
    console.log(`   - Simulasi LPG: http://localhost:${PORT}/api/simulasi-lpg-3kg`);
    console.log(`   - Simulasi LPG: http://localhost:${PORT}/api/login`);
  });
});