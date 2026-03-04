import admin from 'firebase-admin';

const getServiceAccount = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in environment variables.'
    );
  }

  return { projectId, clientEmail, privateKey };
};

const getFirebaseAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
  });
};

export const getFirebaseAdminAuth = () => {
  getFirebaseAdminApp();
  return admin.auth();
};
