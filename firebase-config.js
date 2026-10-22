/**
 * LigaPro – Configuración de Firebase
 * ------------------------------------
 * 1. https://console.firebase.google.com → Crear proyecto
 * 2. Añadir app Web → copiar la config aquí abajo
 * 3. Crear Firestore Database (modo prueba al inicio)
 * 4. Reglas de Firestore (desarrollo):
 *
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /{document=**} {
 *       allow read, write: if true;
 *     }
 *   }
 * }
 *
 * Cuando termines las pruebas, activa Authentication y restringe las reglas.
 */

// ⚠️ REEMPLAZA con los datos de tu proyecto
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Pon true cuando hayas pegado tu config real
const USE_FIREBASE = false;
