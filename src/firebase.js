import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIza...',
  authDomain: 'salary-b9279.firebaseapp.com',
  projectId: 'salary-b9279',
  storageBucket: 'salary-b9279.firebasestorage.app',
  messagingSenderId: '799873307547',
  appId: '1:799873307547:web:e6986e2c1f7849a191873e',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
