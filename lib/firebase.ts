import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCsFDNOWDayWWsRGhxiWctelaMeJ9N-nVY',
  authDomain: 'v0-based-to-do.firebaseapp.com',
  projectId: 'v0-based-to-do',
  storageBucket: 'v0-based-to-do.firebasestorage.app',
  messagingSenderId: '392699443654',
  appId: '1:392699443654:web:691c141cc82436346cdac7',
}

// Prevent duplicate app initialization in Next.js dev (hot-reload) environments.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db = getFirestore(app)
