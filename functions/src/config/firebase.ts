import admin from 'firebase-admin';

let initialized = false;

export function initFirebaseAdmin(): admin.app.App {
  if (initialized) return admin.app();
  // In Cloud Functions, the default credential is auto-provided.
  admin.initializeApp();
  initialized = true;
  return admin.app();
}

export function getFirestore(): admin.firestore.Firestore {
  initFirebaseAdmin();
  return admin.firestore();
}

export function getAppCheck(): admin.appCheck.AppCheck {
  initFirebaseAdmin();
  return admin.appCheck();
}
