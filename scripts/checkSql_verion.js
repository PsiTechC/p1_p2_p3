// scripts/sql_diag.js
// Purpose: end-to-end Azure SQL connectivity & login diagnostics using SQL_* env vars.
// Usage: node scripts/sql_diag.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const sql = require('mssql');

const SHOW_SAMPLE_TABLE = '[dbo].[healthcare_members]'; // change if needed

// ---- Helpers ---------------------------------------------------------------

const show = (k) => (process.env[k] ? '[set]' : '[missing]');
const trimOr = (s, fallback = '') => (typeof s === 'string' ? s.trim() : fallback);

function parseServerShort(server) {
  const s = trimOr(server).replace(/^tcp:/i, '').split(',')[0]; // strip tcp: and ,port
  return s.split('.')[0] || s;
}

function makeConfig({ user, server, database, port }) {
  return {
    user,
    password: process.env.SQL_PASSWORD, // do not trim—password may intentionally have spaces
    server: trimOr(server),
    ...(database ? { database: trimOr(database) } : {}),
    port: 1433, // FORCE 1433 for diagnostics regardless of env
    options: {
      encrypt: true,
      trustServerCertificate: false,
      connectionStrategy: 'proxy', // keep all traffic on 1433
      requestTimeout: 30000,
      connectTimeout: 30000,
    },
    pool: { min: 0, max: 5, idleTimeoutMillis: 30000 },
  };
}

async function tryConnectOnce(cfg, label, runSample = false) {
  let pool;
  try {
    pool = await sql.connect(cfg);
    const db = cfg.database || '(master)';
    console.log(`✅ Connected as "${cfg.user}" to ${cfg.server} / DB: ${db} [${label}]`);

    // Basic server info
    const ver = await pool.request().query('SELECT @@VERSION AS version;');
    console.log('SQL Version snippet:', (ver.recordset?.[0]?.version || '').split('\n')[0]);

    if (runSample && cfg.database && SHOW_SAMPLE_TABLE) {
      try {
        const rs = await pool
          .request()
          .query(`SELECT TOP (1) * FROM ${SHOW_SAMPLE_TABLE};`);
        const row = rs.recordset?.[0];
        console.log(
          row ? `Sample row from ${SHOW_SAMPLE_TABLE}:` : `(no rows in ${SHOW_SAMPLE_TABLE})`,
          row || ''
        );
      } catch (e) {
        console.warn(
          `⚠️  Could not read ${SHOW_SAMPLE_TABLE}:`,
          e?.originalError?.message || e?.message || e
        );
      }
    }
    return true;
  } catch (err) {
    console.error(`❌ Connect failed [${label}]`);
    console.error('   code:', err.code);
    console.error('   message:', err.message);
    if (err.originalError?.message) {
      console.error('   sql msg:', err.originalError.message);
    }
    return false;
  } finally {
    try { await pool?.close(); } catch {}
  }
}

// ---- Start -----------------------------------------------------------------

(async () => {
  // Env summary (no secrets)
  console.log('[ENV SUMMARY]');
  console.log(
    ' SQL_USER', show('SQL_USER'),
    ' SQL_PASSWORD', show('SQL_PASSWORD'),
    ' SQL_DATABASE', show('SQL_DATABASE'),
    ' SQL_SERVER', show('SQL_SERVER'),
    ' SQL_PORT', process.env.SQL_PORT || '(not set, default 1433)'
  );
  console.log(' PW length:', process.env.SQL_PASSWORD ? String(process.env.SQL_PASSWORD).length : 0);

  // Build candidates
  const server = process.env.SQL_SERVER;
  const database = process.env.SQL_DATABASE;
  const userBase = process.env.SQL_USER;
  const serverShort = parseServerShort(server);

  const userCandidates = Array.from(
    new Set([
      userBase,
      `${userBase}@${serverShort}`, // Azure SQL sometimes prefers this format
    ])
  );

  // 1) Try to connect to master first (easier to diagnose login vs DB issues)
  for (const u of userCandidates) {
    const cfgMaster = makeConfig({ user: u, server, port: 1433 });
    const ok = await tryConnectOnce(cfgMaster, `master:${u}`, false);
    if (ok) {
      // 2) Now try the target database with the same username
      const cfgDb = makeConfig({ user: u, server, database, port: 1433 });
      const okDb = await tryConnectOnce(cfgDb, `database:${u}`, true);
      if (okDb) {
        console.log('🎉 Success: login + DB access verified.');
        process.exit(0);
      } else {
        console.log('🔁 Trying next username candidate for target DB...');
      }
    } else {
      console.log('🔁 Trying next username candidate for master...');
    }
  }

  console.error('\n🚫 All attempts failed.');

  // Helpful hints based on common cases:
  console.error(
    [
      '\nQuick checks:',
      '  • Azure SQL server → Security → Authentication: make sure "SQL authentication" is ENABLED.',
      '  • Verify the user exists: use the server admin to create a CONTAINED USER in your target DB, e.g.:',
      "      CREATE USER [sa-admin-np] WITH PASSWORD = 'yourStrongP@ss!';",
      '      ALTER ROLE db_datareader ADD MEMBER [sa-admin-np];',
      '      ALTER ROLE db_datawriter ADD MEMBER [sa-admin-np];',
      '    (Or grant db_owner if appropriate.)',
      '  • Double-check the exact database name (no leading/trailing spaces).',
      '  • Confirm password length above matches your expectation; if not, fix quoting in .env.',
      '  • Network is OK now (no ETIMEOUT). If you see "Cannot open database ... requested by the login",',
      '    the login succeeded but the user lacks access to that DB—create the contained user in that DB.',
    ].join('\n')
  );

  process.exit(1);
})();
