// scripts/read_members.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const sql = require('mssql');

// --- build a safe qualified table name from env ---
// Accepts SQL_TABLE (recommended) or TABLENAME/TABLE_NAME fallbacks.
function toQualifiedTable(raw) {
  if (!raw) throw new Error('Missing table env. Set SQL_TABLE=[dbo].[healthcare_members] in .env');
  const s = String(raw).trim();
  // allow "[dbo].[x]" or "dbo.x" (with extra spaces)
  const m = s.match(/^\s*\[?([A-Za-z0-9_]+)\]?\s*\.\s*\[?([A-Za-z0-9_]+)\]?\s*$/);
  if (!m) throw new Error(
    `Invalid table format: "${raw}". Use [schema].[table] or schema.table (letters/digits/underscore only).`
  );
  const [, schema, table] = m;
  return `[${schema}].[${table}]`;
}

const TABLE_ENV =
  process.env.SQL_TABLE ||
  process.env.TABLENAME ||
  process.env.TABLE_NAME; // choose whichever you set in .env
const QUALIFIED_TABLE = toQualifiedTable(TABLE_ENV || '[dbo].[healthcare_members]');

// --- SQL connection config ---
const config = {
  user: (process.env.SQL_USER || '').trim(),
  password: process.env.SQL_PASSWORD, // do not trim passwords
  server: (process.env.SQL_SERVER || '').trim(),
  database: (process.env.SQL_DATABASE || '').trim(),
  port: Number(process.env.SQL_PORT || 1433),
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectionStrategy: 'proxy', // keep traffic on 1433
    requestTimeout: 30000,
    connectTimeout: 30000
  },
  pool: { min: 0, max: 5, idleTimeoutMillis: 30000 }
};

// quick sanity (no secrets)
console.log('[ENV] server:', config.server, 'db:', config.database, 'port:', config.port);
console.log('[ENV] table:', QUALIFIED_TABLE);

async function queryTop10(pool) {
  const sqlText = `
    SELECT TOP (10) *
    FROM ${QUALIFIED_TABLE}
    ORDER BY 1
  `;
  const res = await pool.request().query(sqlText);
  return res.recordset;
}

async function queryByMemberId(pool, memberId) {
  const sqlText = `
    SELECT TOP (1) *
    FROM ${QUALIFIED_TABLE}
    WHERE MemberID = @memberId
  `;
  const res = await pool.request()
    .input('memberId', sql.VarChar, memberId)
    .query(sqlText);
  return res.recordset[0] || null;
}

(async () => {
  let pool;
  try {
    // fail fast on missing critical env
    for (const [k, v] of Object.entries({
      SQL_USER: config.user, SQL_PASSWORD: config.password,
      SQL_SERVER: config.server, SQL_DATABASE: config.database
    })) {
      if (!v) throw new Error(`Missing env: ${k}`);
    }

    pool = await sql.connect(config);
    console.log('✅ Connected');

    const memberId = process.argv[2];
    if (memberId) {
      const row = await queryByMemberId(pool, memberId);
      if (!row) {
        console.log(`No record found for MemberID="${memberId}"`);
      } else {
        console.log('Record:', row);
      }
    } else {
      const rows = await queryTop10(pool);
      console.log(`Rows (${rows.length}):`);
      console.dir(rows, { depth: 2 });
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.originalError?.message) console.error('SQL says:', err.originalError.message);
    process.exit(1);
  } finally {
    try { await sql.close(); } catch {}
  }
})();
