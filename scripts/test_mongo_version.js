// test_mongo.js
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://cosmosdbadmin:Pass%23%24%25%40123@pisteyovoiceazurecosmosdbmongo.global.mongocluster.cosmos.azure.com/?authSource=new_schema";
const dbName = "new_schema";

async function main() {
  const client = new MongoClient(uri); // no deprecated options needed in v4+

  try {
    console.log("⏳ Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    // Select the database
    const db = client.db(dbName);

    // List all collections
    const collections = await db.listCollections().toArray();

    console.log(`\n📂 Collections in database "${dbName}":`);
    if (collections.length > 0) {
      collections.forEach((col) => console.log(`   📄 ${col.name}`));
    } else {
      console.log("   (no collections found)");
    }

    // Optionally print server info
    const buildInfo = await db.admin().command({ buildInfo: 1 });
    console.log(`\n🖥️ MongoDB Server Version: ${buildInfo.version}`);
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
  } finally {
    await client.close();
    console.log("\n🔌 Connection closed.");
  }
}

main();
