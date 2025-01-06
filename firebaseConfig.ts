// src/firebase.ts
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Configurações do Firebase (substitua pelos seus dados do Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyCtLaKBOMa1iRAHaRZIiD8cF8sh3pORQos",
    authDomain: "agendamento-6085e.firebaseapp.com",
    projectId: "agendamento-6085e",
    storageBucket: "agendamento-6085e.firebasestorage.app",
    messagingSenderId: "658110326622",
    appId: "1:658110326622:web:461c06bc2803c04a4551cf",
    measurementId: "G-28D7DKDJJN"
};

// Inicializando o Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Exportando os serviços que serão usados no projeto
export const auth = getAuth(app); // Serviço de autenticação
export const db: Firestore = getFirestore(app); // Serviço de banco de dados Firestore
const analytics = getAnalytics(app);
export { analytics };