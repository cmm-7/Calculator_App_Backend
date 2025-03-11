const pgp = require("pg-promise")();
require("dotenv").config();
const fs = require("fs");
const path = require("path");

// Load schema.sql file
const schemaPath = path.join(__dirname, "schema.sql");
const schemaSQL = fs.readFileSync(schemaPath, "utf8");

// Extract environment variables
const { DATABASE_URL, PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD } =
  process.env;

const cn = !!DATABASE_URL // Check if DATABASE_URL exists (strict boolean)
  ? {
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Render PostgreSQL
    }
  : {
      host: PG_HOST,
      port: PG_PORT,
      user: PG_USER,
      password: PG_PASSWORD,
      database: "postgres",
    };

const dbAdmin = pgp(cn);

// Function to create the database if it doesn’t exist (Local Only)
const createDatabase = async () => {
  if (isRenderDB) {
    console.log("🚀 Skipping database creation - Using Render PostgreSQL...");
    return;
  }

  try {
    const exists = await dbAdmin.oneOrNone(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [PG_DATABASE]
    );

    if (!exists) {
      console.log(
        `🔹 Database "${PG_DATABASE}" does not exist. Creating it now...`
      );
      await dbAdmin.none(`CREATE DATABASE ${PG_DATABASE}`);
      console.log(`✅ Database "${PG_DATABASE}" created successfully.`);
    } else {
      console.log(`✅ Database "${PG_DATABASE}" already exists.`);
    }
  } catch (err) {
    console.error("❌ Error creating database:", err);
    process.exit(1);
  }
};

// ✅ Function to initialize the schema
const initializeSchema = async () => {
  try {
    console.log("🔹 Connecting to the target database...");

    const db = isRenderDB
      ? dbAdmin // Use Render database
      : pgp({
          host: PG_HOST,
          port: PG_PORT,
          user: PG_USER,
          password: PG_PASSWORD,
          database: PG_DATABASE,
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

// Run steps
const setupDatabase = async () => {
  await createDatabase(); // Creates the database (Local Only)
  await initializeSchema(); // Applies schema (Both Local & Host)
};

setupDatabase();
