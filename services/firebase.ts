import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChWitC41XldL8vysrUzNjVMiZxp9-6gPY",
  authDomain: "sentilytics-f67ec.firebaseapp.com",
  projectId: "sentilytics-f67ec",
  storageBucket: "sentilytics-f67ec.firebasestorage.app",
  messagingSenderId: "834867451324",
  appId: "1:834867451324:web:7e56e792c29873710807b9",
  measurementId: "G-5SWY0CYXTN"
};

if (!firebaseConfig.apiKey) {
    throw new Error("Missing Firebase config: VITE_FIREBASE_API_KEY is not defined in your environment variables.");
}

const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();