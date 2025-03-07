const request = require("supertest");
const app = require("../app");

// *** Quick unit tests without hitting Firebase ***

// Mock Firebase Authentication Middleware
jest.mock("../middleware/firebase", () => {
  return {
    authenticate: (req, res, next) => {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(400).json({ error: "No token provided" });
      }

      if (token === "invalid-token") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      req.user = {
        uid: "mock-uid-12345",
        email: "testuser@example.com",
      };
      next();
    },
  };
});

// Mock the PostgreSQL Database Query for `getUserById`
jest.mock("../queries/authQueries", () => {
  return {
    getUserById: async (uid) => {
      if (uid === "mock-uid-12345") {
        return { uid, email: "testuser@example.com" }; // Simulate user exists
      }
      return null;
    },
  };
});

describe("Authentication API Tests", () => {
  it("should return 400 if no token is provided", async () => {
    const res = await request(app).post("/auth/login");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("No token provided");
  });

  it("should return 401 for an invalid token", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Authorization", "invalid-token");
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("should return 200 and authenticate a valid user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Authorization", "valid-mock-token"); // Simulate valid login
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User authenticated");
  });
});
