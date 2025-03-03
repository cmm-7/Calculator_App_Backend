const pgp = require("pg-promise")();
require("dotenv").config();
const fs = require("fs");
const path = require("path");

// Connect to PostgreSQL without specifying a database (to create one if needed)
const dbAdmin = pgp({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: "postgres", // Connect to the default database first
});

const databaseName = process.env.PG_DATABASE;

const schemaPath = path.join(__dirname, "schema.sql");
const schemaSQL = fs.readFileSync(schemaPath, "utf8");

// Function to create the database if it doesn’t exist
const createDatabase = async () => {
  try {
    const exists = await dbAdmin.oneOrNone(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName]
    );

    if (!exists) {
      console.log(
        `🔹 Database "${databaseName}" does not exist. Creating it now...`
      );
      await dbAdmin.none(`CREATE DATABASE ${databaseName}`);
      console.log(`✅ Database "${databaseName}" created successfully.`);
    } else {
      console.log(`✅ Database "${databaseName}" already exists.`);
    }

    // Now, connect to the new database to create tables
    const db = pgp({
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: databaseName,
    });

    console.log("🔹 Running schema.sql to create tables...");
    await db.none(schemaSQL);
    console.log("✅ Database schema initialized successfully.");
    process.exit();
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    process.exit(1);
  }
};

createDatabase();
