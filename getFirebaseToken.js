const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
require("dotenv").config();

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to get Firebase token
const getFirebaseToken = async () => {
  try {
    console.log("🔍 Signing in to Firebase...");

    const userCredential = await signInWithEmailAndPassword(
      auth,
      process.env.FIREBASE_TEST_EMAIL,
      process.env.FIREBASE_TEST_PASSWORD
    );

    const idToken = await userCredential.user.getIdToken();
    console.log("✅ Firebase ID Token Retrieved");
    return idToken;
  } catch (error) {
    console.error("❌ Error signing in:", error.message);
    throw new Error("Failed to retrieve Firebase token");
  }
};

// ✅ Export function for Jest testing
module.exports = { getFirebaseToken };

// ✅ Only run this script when executed directly
if (require.main === module) {
  getFirebaseToken()
    .then((token) => {
      console.log("📝 Your Firebase Token:", token);
    })
    .catch((error) => {
      console.error("❌ Error retrieving token:", error.message);
    });
}
