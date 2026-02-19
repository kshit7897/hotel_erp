// Firebase Admin SDK is removed as per request.
// This file is kept to avoid breaking imports but will throw errors if used.

export const auth: any = {
  createUser: () => { throw new Error("Firebase Admin SDK removed"); },
  setCustomUserClaims: () => { throw new Error("Firebase Admin SDK removed"); }
};

export const db: any = {
  collection: () => { throw new Error("Firebase Admin SDK removed"); }
};
