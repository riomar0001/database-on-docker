import { fileURLToPath } from "url";
import { basename } from "path";
import { MongoClient } from "mongodb";
import mysql from "mysql2/promise";
import pkg from "pg";
const { Client } = pkg;
import redis from "redis";

// Database configurations
const configs = {
  mongodb: {
    uri: "mongodb://root:password@localhost:27017",
    options: {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    },
  },
  mysql: {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "password",
    connectTimeout: 5000,
  },
  postgresql: {
    host: "localhost",
    port: 5432,
    user: "admin",
    password: "password",
    database: "postgres",
    connectionTimeoutMillis: 5000,
  },
  redis: {
    host: "localhost",
    port: 6379,
    password: "password",
  },
};

// Test MongoDB connection
const testMongoDB = async () => {
  console.log("\nTesting MongoDB connection...");
  try {
    const client = new MongoClient(
      configs.mongodb.uri,
      configs.mongodb.options
    );
    await client.connect();

    const db = client.db("test");
    const collection = db.collection("test_collection");

    // Insert test document
    await collection.insertOne({ test: "connection", timestamp: new Date() });

    // Query test document
    const result = await collection.findOne({ test: "connection" });

    // Clean up
    await collection.deleteOne({ test: "connection" });
    await client.close();

    console.log("MongoDB: Connected successfully");
    console.log(
      `  - Test document inserted and retrieved: ${
        result ? "Success" : "Failed"
      }`
    );
    return true;
  } catch (error) {
    console.log("❌ MongoDB: Connection failed");
    console.log(`   Error: ${error.message}`);
    return false;
  }
};

// Test MySQL connection
const testMySQL = async () => {
  console.log("\nTesting MySQL connection...");
  try {
    const connection = await mysql.createConnection(configs.mysql);

    // Test query
    const [rows] = await connection.execute(
      "SELECT VERSION() as version, NOW() as now"
    );

    await connection.end();

    console.log("MySQL: Connected successfully");
    console.log(`  - Version: ${rows[0].version}`);
    console.log(`  - Current time: ${rows[0].now}`);
    return true;
  } catch (error) {
    console.log("MySQL: Connection failed");
    console.log(`   Error: ${error.message}`);
    return false;
  }
};

// Test PostgreSQL connection
const testPostgreSQL = async () => {
  console.log("\nTesting PostgreSQL connection...");
  try {
    const client = new Client(configs.postgresql);
    await client.connect();

    // Test query
    const result = await client.query("SELECT version(), NOW()");

    await client.end();

    console.log("PostgreSQL: Connected successfully");
    console.log(
      `  - Version: ${result.rows[0].version.split(" ")[0]} ${
        result.rows[0].version.split(" ")[1]
      }`
    );
    console.log(`  - Current time: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.log("PostgreSQL: Connection failed");
    console.log(`   Error: ${error.message}`);
    return false;
  }
};

// Test Redis connection
const testRedis = async () => {
  console.log("\nTesting Redis connection...");
  try {
    const client = redis.createClient({
      socket: {
        host: configs.redis.host,
        port: configs.redis.port,
      },
      password: configs.redis.password,
    });

    await client.connect();

    // Test set and get
    await client.set("test_key", "test_value");
    const value = await client.get("test_key");

    // Clean up
    await client.del("test_key");

    // Get Redis info
    const info = await client.info("server");
    const version = info.match(/redis_version:([^\r\n]+)/)[1];

    await client.quit();

    console.log("Redis: Connected successfully");
    console.log(`  - Version: ${version}`);
    console.log(
      `  - Test key set and retrieved: ${
        value === "test_value" ? "Success" : "Failed"
      }`
    );
    return true;
  } catch (error) {
    console.log("Redis: Connection failed");
    console.log(`   Error: ${error.message}`);
    return false;
  }
};

// Test individual database with retry logic
const testWithRetry = async (testFn, dbName, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await testFn();
    if (result) return true;

    if (attempt < maxRetries) {
      console.log(`   Retry ${attempt}/${maxRetries - 1} for ${dbName}...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  return false;
};

// Enhanced main test function
const testAllDatabases = async () => {
  console.log("Testing database connections...");
  console.log("=====================================");

  const startTime = Date.now();

  // Run tests with retry logic
  const results = {
    mysql: await testWithRetry(testMySQL, "MySQL"),
    postgresql: await testWithRetry(testPostgreSQL, "PostgreSQL"),
    mongodb: await testWithRetry(testMongoDB, "MongoDB"),
    redis: await testWithRetry(testRedis, "Redis"),
  };

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  console.log("\nTest Results Summary");
  console.log("=====================================");

  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  Object.entries(results).forEach(([db, success]) => {
    console.log(`${db.toUpperCase()}: ${success ? "Connected" : "Failed"}`);
  });

  console.log(
    `\nSuccess Rate: ${successCount}/${totalCount} (${Math.round(
      (successCount / totalCount) * 100
    )}%)`
  );
  console.log(`⏱ Total Time: ${totalTime}ms`);

  // Docker status check for failed connections
  if (successCount < totalCount) {
    console.log("\nTroubleshooting Tips:");
    console.log("=====================================");
    if (!results.mysql) console.log("- Check MySQL: docker ps | grep mysql");
    if (!results.postgresql)
      console.log("- Check PostgreSQL: docker ps | grep postgres");
    if (!results.mongodb)
      console.log("- Check MongoDB: docker ps | grep mongo");
    if (!results.redis) console.log("- Check Redis: docker ps | grep redis");
    console.log("- Restart failed containers: docker restart <container_name>");
  }

  if (successCount === totalCount) {
    console.log("\nAll databases are connected and working properly!");
    process.exit(0);
  } else {
    console.log(
      "\nSome database connections failed. Check Docker containers and configurations."
    );
    process.exit(1);
  }
};

// Test specific database function
const testSpecific = async (dbName) => {
  const testMap = {
    mongodb: testMongoDB,
    mysql: testMySQL,
    postgresql: testPostgreSQL,
    postgres: testPostgreSQL,
    redis: testRedis,
  };

  const testFn = testMap[dbName.toLowerCase()];
  if (!testFn) {
    console.log(`❌ Unknown database: ${dbName}`);
    console.log("Available: mongodb, mysql, postgresql, redis");
    return false;
  }

  console.log(`🔍 Testing ${dbName} connection...`);
  console.log("=====================================");

  return await testWithRetry(testFn, dbName);
};

// Enhanced error handling
const handleError = (error) => {
  console.log("\n💥 Unexpected error occurred:");
  console.log(`   Error: ${error.message}`);
  if (process.env.NODE_ENV === "development") {
    console.log(`   Stack: ${error.stack}`);
  }
  process.exit(1);
};

// Process event handlers
process.on("SIGINT", () => {
  console.log("\n\n👋 Test interrupted by user");
  process.exit(0);
});

process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);

// Check if running as main module
const isMain =
  basename(process.argv[1]) === basename(fileURLToPath(import.meta.url));

// Main execution logic
if (isMain) {
  console.log("🚀 Database Connection Tester v1.0");
  console.log("=====================================");

  // Check for specific database test
  const dbArg = process.argv[2];

  try {
    if (dbArg) {
      await testSpecific(dbArg);
    } else {
      await testAllDatabases();
    }
  } catch (error) {
    handleError(error);
  }
}

export {
  testMongoDB,
  testMySQL,
  testPostgreSQL,
  testRedis,
  testAllDatabases,
  testSpecific,
};
