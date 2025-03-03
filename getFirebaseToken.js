const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
require("dotenv").config();

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

console.log("🔍 Firebase Config:", firebaseConfig);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sign in and get ID token
const email = process.env.FIREBASE_TEST_EMAIL;
const password = process.env.FIREBASE_TEST_PASSWORD;

console.log("🔍 Signing in with email:", email);

signInWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    const idToken = await userCredential.user.getIdToken();
    console.log("✅ Firebase ID Token:", idToken);
  })
  .catch((error) => {
    console.error("❌ Error signing in:", error.message);
  });
