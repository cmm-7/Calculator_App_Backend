const request = require("supertest");
const app = require("../app");
const db = require("../db/dbConfig");

// *** Testing calculations independently without Firebase authentication. ***

const mockUserId = "mock-uid-12345";
const mockUserEmail = "testuser@example.com";

// Mock Firebase Authentication Middleware
jest.mock("../middleware/firebase", () => {
  return {
    authenticate: (req, res, next) => {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      if (token === "expired-mock-token") {
        return res
          .status(401)
          .json({ error: "Token expired. Please log in again." });
      }

      if (token === "invalid-token") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      req.user = {
        uid: mockUserId,
        email: mockUserEmail,
      };
      next();
    },
  };
});

beforeAll(async () => {
  // Ensure the mock user exists before testing calculations
  await db.none(
    "INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
    [mockUserId, mockUserEmail]
  );
});

describe("Calculations API Tests", () => {
  it("should return 401 if user is not authenticated", async () => {
    const res = await request(app)
      .get("/calculations")
      .set("Authorization", "");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("No token provided");
  });

  it("should return 401 if the token is expired", async () => {
    const res = await request(app)
      .get("/calculations")
      .set("Authorization", "expired-mock-token");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Token expired. Please log in again.");
  });

  it("should return 400 if required fields are missing when creating a calculation", async () => {
    const res = await request(app)
      .post("/calculations")
      .set("Authorization", "valid-mock-token")
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Expression and result are required");
  });

  it("should return 201 when saving a calculation", async () => {
    const res = await request(app)
      .post("/calculations")
      .set("Authorization", "valid-mock-token")
      .send({ expression: "5+5", result: "10" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Calculation saved successfully");
  });
});

afterAll(async () => {
  await db.none("DELETE FROM users WHERE id = $1", [mockUserId]);
});
