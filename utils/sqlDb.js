// // utils/sqlDb.js
// const sql = require('mssql');

// const config = {
//   user: 'saadmin',
//   password: 'G8r!xN2#qP9$uL7@wT5',
//   database: 'n8naisqldb',
//   server: 'n8naisqlserver.database.windows.net',
//   port: 1433,
//   options: {
//     encrypt: true,
//     trustServerCertificate: false
//   }
// };

// let poolPromise = null;

// async function getPool() {
//   if (!poolPromise) {
//     poolPromise = sql.connect(config);
//   }
//   return poolPromise;
// }

// async function findCustomerByMemberId(memberID) {
//   try {
//     const pool = await getPool();
//     const result = await pool.request()
//       .input('memberID', sql.Int, memberID)
//       .query('SELECT * FROM HealthcareMembers WHERE MemberID = @memberID');

//     if (result.recordset.length === 0) return null;

//     const row = result.recordset[0];

//     // Map SQL result to your app format
//     return {
//       memberID: row.MemberID,
//       name: `${row.FirstName} ${row.LastName}`,
//       dob: row.DOB,
//       planId: row.PlanName,   // ✅ use PlanName as planId for RAG pipeline
//       address: row.FullAddress
//     };
//   } catch (err) {
//     console.error('❌ SQL Error:', err);
//     throw err;
//   }
// }

// module.exports = { getPool, findCustomerByMemberId };





// // utils/sqlDb.js
// const sql = require('mssql');
// require('dotenv').config();  // Load from .env

// const config = {
//   user: process.env.AZURE_SQL_USER,
//   password: process.env.AZURE_SQL_PASSWORD,
//   database: process.env.AZURE_SQL_DB,
//   server: process.env.AZURE_SQL_SERVER,
//   port: parseInt(process.env.AZURE_SQL_PORT, 10) || 1433,
//   options: {
//     encrypt: true,
//     trustServerCertificate: false
//   }
// };

// let poolPromise = null;

// async function getPool() {
//   if (!poolPromise) {
//     poolPromise = sql.connect(config);
//   }
//   return poolPromise;
// }

// async function findCustomerByMemberId(memberID) {
//   try {
//     const pool = await getPool();
//     const result = await pool.request()
//       .input('memberID', sql.Int, memberID)
//       .query('SELECT * FROM HealthcareMembers WHERE MemberID = @memberID');

//     if (result.recordset.length === 0) return null;

//     const row = result.recordset[0];

//     return {
//       memberID: row.MemberID,
//       name: `${row.FirstName} ${row.LastName}`,
//       dob: row.DOB,
//       planId: row.PlanName,  // ✅ Used as plan_id
//       address: row.FullAddress
//     };
//   } catch (err) {
//     console.error('❌ SQL Error:', err);
//     throw err;
//   }
// }

// module.exports = { getPool, findCustomerByMemberId };









// const sql = require("mssql");

// const config = {
//   user: process.env.SQL_USER,
//   password: process.env.SQL_PASSWORD,
//   server: process.env.SQL_SERVER,
//   port: Number(process.env.SQL_PORT ),
//   database: process.env.SQL_DATABASE,
//   options: {
//     encrypt: true, // Azure SQL requires this
//     trustServerCertificate: false
//   }
// };

// async function findCustomerByMemberId(memberId) {
//   try {
//     const pool = await sql.connect(config);
//     // const result = await pool.request()
//     //   .input("memberId", sql.VarChar, memberId)
//     //   .query(`
//     //     SELECT * FROM HealthcareMembers WHERE MemberID = @memberId
//     //   `);


//     const result = await pool.request()
//   .input("memberId", sql.VarChar, memberId)
//   .query(`
//     SELECT * 
//     FROM [dbo].[healthcare_members]
//     WHERE MemberID = @memberId
//   `);


//     if (result.recordset.length === 0) return null;

//     const row = result.recordset[0];

//     return {
//       name: `${row.FirstName} ${row.LastName}`,
//       dob: row.DOB,
//       address: row.FullAddress,
//       planId: row.PlanName
//     };
//   } catch (err) {
//     console.error("❌ SQL Error:", err);
//     throw err;
//   } finally {
//     await sql.close();
//   }
// }

// async function checkMemberEligibility(memberId, dob) {
//   const pool = await sql.connect(config);
//   const result = await pool.request()
//     .input("MemberID", sql.VarChar, memberId)
//     .input("DateOfBirth", sql.Date, dob)
//     .execute("sp_provider_member_eligiblity_check");
//   await sql.close();
//   return result.recordset;
// }

// async function checkProviderClaimStatus(tin, memberId, dob, dos = null) {
//   const pool = await sql.connect(config);
//   const req = pool.request()
//     .input("BillingProviderTIN", sql.VarChar, tin)
//     .input("MemberID", sql.VarChar, memberId)
//     .input("DateOfBirth", sql.Date, dob);
//   if (dos) req.input("DateOfService", sql.Date, dos);
//   const result = await req.execute("sp_provider_claims_status_check");
//   await sql.close();
//   return result.recordset;
// }





// module.exports = {
//   findCustomerByMemberId,
//   checkMemberEligibility,
//   checkProviderClaimStatus
// };



//  New_Schema_RAG_reteival_azure_SQL\utils\sqlDb.js


const sql = require("mssql");

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  port: Number(process.env.SQL_PORT),
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true, // Azure SQL requires this
    trustServerCertificate: false,
  },
};

// Utility to log queries in a structured way
function logQuery(label, data) {
  console.log(`\n📡 [${label}]`, JSON.stringify(data, null, 2));
}

async function findCustomerByMemberId(memberId) {
  console.log(`🔎 findCustomerByMemberId() called with MemberID=${memberId}`);
  try {
    const pool = await sql.connect(config);
    logQuery("SQL Query", {
      statement: "SELECT * FROM [dbo].[healthcare_members] WHERE MemberID=@memberId",
      parameters: { memberId },
    });

    const result = await pool
      .request()
      .input("memberId", sql.VarChar, memberId)
      .query(`SELECT * FROM [dbo].[healthcare_members] WHERE MemberID = @memberId`);

    console.log(`✅ Query returned ${result.recordset.length} row(s)`);
    if (result.recordset.length === 0) return null;

    const row = result.recordset[0];
    logQuery("SQL Row Result", row);

    return {
      name: `${row.FirstName} ${row.LastName}`,
      dob: row.DOB,
      address: row.FullAddress,
      planId: row.PlanName,
    };
  } catch (err) {
    console.error("❌ SQL Error in findCustomerByMemberId:", err);
    throw err;
  } finally {
    await sql.close();
  }
}

async function checkMemberEligibility(memberId, dob) {
  console.log(`🔎 checkMemberEligibility() called with MemberID=${memberId}, DOB=${dob}`);
  try {
    const pool = await sql.connect(config);
    logQuery("Stored Procedure Call", {
      procedure: "sp_provider_member_eligiblity_check",
      parameters: { MemberID: memberId, DateOfBirth: dob },
    });

    const result = await pool
      .request()
      .input("MemberID", sql.VarChar, memberId)
      .input("DateOfBirth", sql.Date, dob)
      .execute("sp_provider_member_eligiblity_check");

    console.log(`✅ Eligibility procedure returned ${result.recordset.length} row(s)`);
    logQuery("Eligibility Recordset", result.recordset);

    return result.recordset;
  } catch (err) {
    console.error("❌ SQL Error in checkMemberEligibility:", err);
    throw err;
  } finally {
    await sql.close();
  }
}

async function checkProviderClaimStatus(tin, memberId, dob, dos = null) {
  console.log(
    `🔎 checkProviderClaimStatus() called with TIN=${tin}, MemberID=${memberId}, DOB=${dob}, DOS=${dos || "N/A"}`
  );
  try {
    const pool = await sql.connect(config);
    const req = pool
      .request()
      .input("BillingProviderTIN", sql.VarChar, tin)
      .input("MemberID", sql.VarChar, memberId)
      .input("DateOfBirth", sql.Date, dob);

    if (dos) req.input("DateOfService", sql.Date, dos);

    logQuery("Stored Procedure Call", {
      procedure: "sp_provider_claims_status_check",
      parameters: {
        BillingProviderTIN: tin,
        MemberID: memberId,
        DateOfBirth: dob,
        DateOfService: dos || null,
      },
    });

    const result = await req.execute("sp_provider_claims_status_check");

    console.log(`✅ Claim status procedure returned ${result.recordset.length} row(s)`);
    logQuery("Claim Status Recordset", result.recordset);

    return result.recordset;
  } catch (err) {
    console.error("❌ SQL Error in checkProviderClaimStatus:", err);
    throw err;
  } finally {
    await sql.close();
  }
}

module.exports = {
  findCustomerByMemberId,
  checkMemberEligibility,
  checkProviderClaimStatus,
};
