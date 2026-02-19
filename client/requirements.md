## Packages
firebase | Firebase SDK for Auth and Firestore
recharts | For the admin dashboard analytics charts
framer-motion | For smooth page transitions and micro-interactions

## Notes
Firebase configuration is expected in environment variables:
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID

The app uses a "mobile-first" approach, so layouts should be responsive.
Role-based routing is required (Admin vs Staff).
