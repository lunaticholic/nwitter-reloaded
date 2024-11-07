// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvfsX6925Lmi2XnZPW1W2X4k62ClNfiMc",
  authDomain: "nwitter-reloaded-9659a.firebaseapp.com",
  projectId: "nwitter-reloaded-9659a",
  storageBucket: "nwitter-reloaded-9659a.firebasestorage.app",
  messagingSenderId: "812486670431",
  appId: "1:812486670431:web:bf8d73bc467e4b85fec3ea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 우리 앱에 authentication을 지원하는 경우 아래처럼 코드를 작성해야 지원이 가능하다
export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);