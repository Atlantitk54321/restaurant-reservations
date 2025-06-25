// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js"; // Inicializon aplikacionin Firebase
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js"; // Për statistika (opsional)

import {
  getAuth, // Për autentifikim
  createUserWithEmailAndPassword, // Funksion për regjistrim të ri
  signInWithEmailAndPassword, // Funksion për hyrje
  signOut, // Funksion për dalje
  onAuthStateChanged // Monitoron nëse përdoruesi është i futur apo jo
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  getFirestore, // Merr instancën e Firestore database
  collection, // Referon një koleksion të dokumenteve
  addDoc, // Shton një dokument të ri në koleksion
  getDocs, // Merr të gjitha dokumentet nga një koleksion ose query
  query, // Krijon një pyetje për të filtruar dokumentet
  where // Krijon kushte në pyetje
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB8sXHZBOWfGC4nT92ztT2oBtX_raFx1jE", // Çelësi API për autentifikim të Firebase
  authDomain: "rezervimerestoranti.firebaseapp.com", // Domeni për autentifikim
  projectId: "rezervimerestoranti", // ID e projektit në Firebase
  storageBucket: "rezervimerestoranti.firebasestorage.app", // Bucket për ruajtje file (nuk përdoret këtu)
  messagingSenderId: "549228399043", // ID për mesazhe (p.sh. push notifications)
  appId: "1:549228399043:web:3013e143084226cc8d5576", // ID unike e aplikacionit
  measurementId: "G-GGYQQXH9YN" // ID për analytics (opsional)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // Inicializon Firebase me konfigurimet e sipërme
const analytics = getAnalytics(app); // Inicializon analytics (jo e domosdoshme)
const auth = getAuth(app); // Merr instancën e autentifikimit
const db = getFirestore(app); // Merr instancën e Firestore database

// DOM elements
const email = document.getElementById("email"); // Input për email-in e përdoruesit
const password = document.getElementById("password"); // Input për fjalëkalimin
const signupBtn = document.getElementById("signup"); // Butoni për regjistrim
const loginBtn = document.getElementById("login"); // Butoni për hyrje
const logoutBtn = document.getElementById("logout"); // Butoni për dalje

const dataInput = document.getElementById("data"); // Input për datën e rezervimit
const oraInput = document.getElementById("ora"); // Input për orën e rezervimit
const personatInput = document.getElementById("personat"); // Input për numrin e personave
const rezervimBtn = document.getElementById("rezervo"); // Butoni për të bërë rezervim
const lista = document.getElementById("lista-rezervimeve"); // Lista ku do të shfaqen rezervimet
const rezervimeSection = document.getElementById("rezervime-section"); // Seksioni që përmban formën dhe listën e rezervimeve

// Regjistrimi i përdoruesit
signupBtn.onclick = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value) // Krijon përdorues të ri me email dhe password
    .then(() => alert("U regjistrove me sukses")) // Nëse regjistrimi kalon me sukses, shfaq mesazh
    .catch(err => alert(err.message)); // Nëse ndodh gabim, shfaq mesazhin e gabimit
};

// Hyrja e përdoruesit
loginBtn.onclick = () => {
  signInWithEmailAndPassword(auth, email.value, password.value) // Autentifikon përdoruesin me email/password
    .catch(err => alert(err.message)); // Nëse ndodh gabim, shfaq mesazhin e gabimit
};

// Dalja e përdoruesit
logoutBtn.onclick = () => {
  signOut(auth); // Shkyç përdoruesin aktual
};

// Monitorimi i gjendjes së autentifikimit (kur përdoruesi futet ose del)
onAuthStateChanged(auth, user => {
  if (user) {
    // Nëse përdoruesi është i futur:
    logoutBtn.style.display = "inline-block"; // Shfaq butonin e daljes
    rezervimeSection.style.display = "block"; // Shfaq seksionin e rezervimeve
    shfaqRezervimet(user.uid); // Thirr funksionin që shfaq rezervimet e përdoruesit
  } else {
    // Nëse nuk është i futur:
    logoutBtn.style.display = "none"; // Fshih butonin e daljes
    rezervimeSection.style.display = "none"; // Fshih seksionin e rezervimeve
  }
});

// Kur përdoruesi klik "Rezervo"
rezervimBtn.onclick = async () => {
  const user = auth.currentUser; // Merr përdoruesin aktual
  if (!user) return; // Nëse nuk ka përdorues të futur, ndalo funksionin

  // Shton një dokument të ri në koleksionin "rezervime"
  await addDoc(collection(db, "rezervime"), {
    userId: user.uid, // ID e përdoruesit që bën rezervimin
    data: dataInput.value, // Data e zgjedhur nga inputi
    ora: oraInput.value, // Ora e zgjedhur nga inputi
    personat: parseInt(personatInput.value) // Numri i personave
  });

  alert("Rezervimi u bë me sukses!"); // Mesazh konfirmimi

  // Pastro inputet
  dataInput.value = "";
  oraInput.value = "";
  personatInput.value = "";

  // Rifresko listën e rezervimeve
  shfaqRezervimet(user.uid);
};

// Funksioni për të shfaqur rezervimet e një përdoruesi
async function shfaqRezervimet(uid) {
  lista.innerHTML = ""; // Pastro listën ekzistuese

  // Krijo pyetjen për të marrë vetëm rezervimet e përdoruesit aktual
  const q = query(collection(db, "rezervime"), where("userId", "==", uid));

  const snapshot = await getDocs(q); // Ekzekuto pyetjen dhe merr dokumentet

  // Për çdo dokument të marrë nga Firestore
  snapshot.forEach(doc => {
    const r = doc.data(); // Merr të dhënat e dokumentit
    const li = document.createElement("li"); // Krijo elementin HTML <li>
    li.textContent = `${r.data} ora ${r.ora} - ${r.personat} persona`; // Teksti që tregon detajet e rezervimit
    lista.appendChild(li); // Shto elementin në listën HTML
  });
}

