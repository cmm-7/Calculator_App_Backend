const request = require("supertest");
const app = require("../app");
const { getFirebaseToken } = require("../getFirebaseToken");
const db = require("../db/dbConfig"); // ✅ Import database

// *** End-to-end testing with Firebase Authentication ***

let idToken;
let calculationId;

beforeAll(async () => {
  // Ensure the test user is deleted before running tests
  await db.none("DELETE FROM users WHERE email = $1", [
    process.env.FIREBASE_TEST_EMAIL,
  ]);

  // Get real Firebase ID token
  idToken = await getFirebaseToken();
});

describe("🔹 API Route Integration Tests", () => {
  it("should sign up a new user", async () => {
    const res = await request(app)
      .post("/auth/signup")
      .set("Authorization", idToken);

    console.log("🔎 Signup Response:", res.statusCode, res.body);

    if (res.statusCode === 400) {
      expect(res.body.error).toBe("User already exists.");
    } else {
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User signed up successfully");
    }
  });

  it("should authenticate a user and return user data", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Authorization", idToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User authenticated");
  });

  it("should save a new calculation", async () => {
    const res = await request(app)
      .post("/calculations")
      .set("Authorization", idToken)
      .send({ expression: "5+5", result: "10" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Calculation saved successfully");
    calculationId = res.body.id;
  });

  it("should retrieve user calculations", async () => {
    const res = await request(app)
      .get("/calculations")
      .set("Authorization", idToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should update a calculation", async () => {
    const res = await request(app)
      .put(`/calculations/${calculationId}`)
      .set("Authorization", idToken)
      .send({ expression: "10*10", result: "100" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Calculation updated successfully");
  });

  it("should delete a calculation", async () => {
    const res = await request(app)
      .delete(`/calculations/${calculationId}`)
      .set("Authorization", idToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Calculation deleted successfully");
  });
});

afterAll(async () => {
  console.log("🛑 Closing Firebase Admin SDK and database connection...");

  const { getAuth } = require("firebase-admin/auth");
  const admin = require("firebase-admin");

  // ✅ Close Firebase Admin SDK
  if (admin.apps.length) {
    await getAuth().app.delete();
  }

  // ✅ Close PostgreSQL Connection (Fixes Open Handle Issue)
  await db.$pool.end();

  console.log("✅ Firebase Admin SDK and database connection closed.");
  await new Promise((resolve) => setTimeout(resolve, 500));
});
