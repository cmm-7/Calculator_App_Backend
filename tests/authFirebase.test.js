const request = require("supertest");
const app = require("../app");
const { getFirebaseToken } = require("../getFirebaseToken");

//*** Testing real authentication with Firebase. ***

describe("Firebase Authentication API Tests", () => {
  let realIdToken;

  beforeAll(async () => {
    realIdToken = await getFirebaseToken(); // Fetch real Firebase token before tests
  });

  it("should return 200 and authenticate a valid user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Authorization", realIdToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User authenticated");
  });

  it("should return 401 if an expired or invalid token is provided", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Authorization", "invalid-fake-token"); // Simulate invalid token

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  afterAll(async () => {
    const { getAuth } = require("firebase-admin/auth");
    const admin = require("firebase-admin");

    if (admin.apps.length) {
      console.log("🛑 Closing Firebase Admin SDK...");
      await getAuth().app.delete();
    }

    console.log("✅ Firebase Admin SDK closed.");

    await new Promise((resolve) => setTimeout(resolve, 500));
  });
});
