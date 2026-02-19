import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountStr) {
      const serviceAccount = JSON.parse(serviceAccountStr);
      if (serviceAccount.project_id) {
         admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        console.warn("FIREBASE_SERVICE_ACCOUNT invalid JSON. Backend Firebase features disabled.");
      }
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT not set. Backend Firebase features disabled.");
      // Initialize with a mock/null credential if needed to prevent crash, 
      // but usually better to let auth() fail gracefully or mock it.
      // However, admin.auth() throws if no app.
      
      // MOCK INITIALIZATION for development without credentials
      // This allows the server to start, but actual calls will fail or need mocking.
      // Using a dummy project ID.
      admin.initializeApp({
        projectId: "demo-project", 
      });
      console.log("Initialized Firebase Admin with demo-project for development.");
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
}

export const auth = admin.auth();
export const db = admin.firestore();
