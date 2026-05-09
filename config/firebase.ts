// // Import the functions you need from the SDKs you need
// import * as firebase from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAwztpukV5Efwuz3z1u9j4fgRxXaXzX6KM",
//   authDomain: "fir-neurosync.firebaseapp.com",
//   projectId: "fir-neurosync",
//   storageBucket: "fir-neurosync.firebasestorage.app",
//   messagingSenderId: "906464616373",
//   appId: "1:906464616373:web:245ceeb551b3edc32883fc",
// };

// // Initialize Firebase
// let app;
// if (firebase.getApps.length === 0) {
//   app = firebase.initializeApp(firebaseConfig);
// } else {
//   app = firebase.getApp();
// }

// const auth = firebase.auth();

// export { auth };

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwztpukV5Efwuz3z1u9j4fgRxXaXzX6KM",
  authDomain: "fir-neurosync.firebaseapp.com",
  projectId: "fir-neurosync",
  storageBucket: "fir-neurosync.firebasestorage.app",
  messagingSenderId: "906464616373",
  appId: "1:906464616373:web:245ceeb551b3edc32883fc",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
