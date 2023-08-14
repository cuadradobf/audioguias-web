import { FirebaseApp, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBB1VMFpn3cSW_YUWTYV4sRGyEx2JH_2sg",
  authDomain: "audioguias-24add.firebaseapp.com",
  projectId: "audioguias-24add",
  storageBucket: "audioguias-24add.appspot.com",
  messagingSenderId: "831008053810",
  appId: "1:831008053810:web:39288c78ef84d2d4123a2b",
  measurementId: "G-H7SX070HY0"
};

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
