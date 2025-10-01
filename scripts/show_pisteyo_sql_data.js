// // show_pisteyo_sql_data.js
// const path = require("path");
// const dotenv = require("dotenv");
// const sql = require("mssql");

// // ✅ Force dotenv to load the correct .env file
// dotenv.config({ path: path.resolve("c:\\sanket\\New_Schema_RAG_reteival_azure_SQL\\.env") });

// console.log("[DEBUG] Loaded ENV:");
// console.log({
//   SQL_SERVER: process.env.SQL_SERVER,
//   SQL_DATABASE: process.env.SQL_DATABASE,
//   SQL_USER: process.env.SQL_USER,
//   SQL_PORT: process.env.SQL_PORT,
// });

// // ✅ Fail fast if we are still pointing to the wrong DB
// if (!process.env.SQL_SERVER.includes("n8naisqlserver")) {
//   console.error(`❌ ERROR: Wrong SQL Server loaded: ${process.env.SQL_SERVER}`);
//   console.error("➡️  Please check your .env file and make sure it has pisteyo SQL details.");
//   process.exit(1);
// }

// const config = {
//   user: process.env.SQL_USER,
//   password: process.env.SQL_PASSWORD,
//   server: process.env.SQL_SERVER,
//   database: process.env.SQL_DATABASE,
//   port: parseInt(process.env.SQL_PORT, 10),
//   options: {
//     encrypt: true,
//     trustServerCertificate: false,
//   },
// };

// (async () => {
//   try {
//     console.log("⏳ Connecting to SQL Server...");
//     const pool = await sql.connect(config);
//     console.log(`✅ Connected to ${process.env.SQL_SERVER}/${process.env.SQL_DATABASE}`);

//     const result = await pool.request().query(`
//       SELECT * FROM [dbo].[healthcare_members] ORDER BY MemberID;
//     `);

//     console.log(`\n📊 Found ${result.recordset.length} rows in [dbo].[healthcare_members]:`);
//     console.table(result.recordset);

//     await pool.close();
//     console.log("🔌 Connection closed.");
//   } catch (err) {
//     console.error("❌ Error reading data:", err);
//   }
// })();




// show full db contents 

const path = require("path");
const dotenv = require("dotenv");
const sql = require("mssql");

// ✅ Load env file
dotenv.config({ path: path.resolve("c:\\sanket\\New_Schema_RAG_reteival_azure_SQL\\.env") });

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  port: parseInt(process.env.SQL_PORT, 10),
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

(async () => {
  try {
    console.log("⏳ Connecting to SQL Server...");
    const pool = await sql.connect(config);
    console.log(`✅ Connected to ${process.env.SQL_SERVER}/${process.env.SQL_DATABASE}`);

    // ✅ Query system catalog to list tables
    const result = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_SCHEMA, TABLE_NAME;
    `);

    console.log(`\n📊 Found ${result.recordset.length} tables in ${process.env.SQL_DATABASE}:`);
    console.table(result.recordset);

    await pool.close();
    console.log("🔌 Connection closed.");
  } catch (err) {
    console.error("❌ Error reading data:", err);
  }
})();
 




// const path = require("path");
// const dotenv = require("dotenv");
// const sql = require("mssql");

// // ✅ Choose which table you want to query
// const TABLE_NAME = "healthcare_members"; // <-- Change this to claim, call_detail, etc.

// dotenv.config({ path: path.resolve("c:\\sanket\\New_Schema_RAG_reteival_azure_SQL\\.env") });

// const config = {
//   user: process.env.SQL_USER,
//   password: process.env.SQL_PASSWORD,
//   server: process.env.SQL_SERVER,
//   database: process.env.SQL_DATABASE,
//   port: parseInt(process.env.SQL_PORT, 10),
//   options: {
//     encrypt: true,
//     trustServerCertificate: false,
//   },
// };

// (async () => {
//   try {
//     console.log("⏳ Connecting to SQL Server...");
//     const pool = await sql.connect(config);
//     console.log(`✅ Connected to ${process.env.SQL_SERVER}/${process.env.SQL_DATABASE}`);

//     // ✅ Get total row count
//     const countResult = await pool.request().query(`
//       SELECT COUNT(*) AS TotalRows
//       FROM [dbo].[${TABLE_NAME}];
//     `);

//     console.log(`\n📊 Total rows in [dbo].[${TABLE_NAME}]: ${countResult.recordset[0].TotalRows}`);

//     // ✅ Fetch top 100 rows if table is not empty
//     if (countResult.recordset[0].TotalRows > 0) {
//       const dataResult = await pool.request().query(`
//         SELECT TOP (100) *
//         FROM [dbo].[${TABLE_NAME}]
//         ORDER BY 1;
//       `);

//       console.log(`\n📊 Showing first ${dataResult.recordset.length} rows from [dbo].[${TABLE_NAME}]:`);
//       console.table(dataResult.recordset);
//     } else {
//       console.log(`⚠️ No data found in [dbo].[${TABLE_NAME}].`);
//     }

//     await pool.close();
//     console.log("🔌 Connection closed.");
//   } catch (err) {
//     console.error("❌ Error reading data:", err);
//   }
// })();
