// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhWENoSrQRMVxNagkzhECRaiozlbeevgc",
  authDomain: "citrusnative.firebaseapp.com",
  projectId: "citrusnative",
  storageBucket: "citrusnative.appspot.com",
  messagingSenderId: "153123374119",
  appId: "1:153123374119:web:bb6c2e7b10914698f2fa02",
  measurementId: "G-9PTVYPPJHC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);