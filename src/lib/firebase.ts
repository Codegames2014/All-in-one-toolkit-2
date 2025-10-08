// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// IMPORTANT: This is a placeholder configuration. 
// In a real application, you would replace this with your actual Firebase project config.
// It is safe to expose this configuration in a client-side application.
// Firebase security rules are used to protect your data.
const firebaseConfig = {
  apiKey: "AIzaSyC12345abcdefghijklmnopqrstuvwxyz", // Replace with your API key
  authDomain: "your-project-id.firebaseapp.com", // Replace with your auth domain
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com", // Replace with your database URL
  projectId: "your-project-id", // Replace with your project ID
  storageBucket: "your-project-id.appspot.com", // Replace with your storage bucket
  messagingSenderId: "123456789012", // Replace with your sender ID
  appId: "1:123456789012:web:1234567890abcdef" // Replace with your app ID
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getDatabase(app);
