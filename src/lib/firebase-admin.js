import admin from 'firebase-admin';
console.log("FIREBASE_ADMIN_KEY_JSON:", process.env.FIREBASE_ADMIN_KEY_JSON);

if (!process.env.FIREBASE_ADMIN_KEY_JSON) {
  throw new Error("FIREBASE_ADMIN_KEY_JSON environment variable is not set.");
}
if (!admin.apps.length) {
  // Parse the Firebase service account JSON from environment variables
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY_JSON);
  console.log("service account", serviceAccount)
  // Initialize Firebase Admin with credentials
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = admin.firestore();

export { admin, adminDb };
