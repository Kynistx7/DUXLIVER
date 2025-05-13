// app.js

// Importa as funções necessárias dos SDKs via URLs (forma padrão para módulos no navegador sem bundler)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";
import {
    getAuth,
    signInWithEmailAndPassword, // Para Login
    createUserWithEmailAndPassword, // Para Registro
    onAuthStateChanged        // Para monitorar estado
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Sua configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDuoV7LXNAtS5Mw4160XNZW3vqLPMWXmjo", // Mantenha como está para web apps
    authDomain: "projetoboaes.firebaseapp.com",
    projectId: "projetoboaes",
    storageBucket: "projetoboaes.firebasestorage.app",
    messagingSenderId: "752100775748",
    appId: "1:752100775748:web:a682e2b132738f74a42911",
    measurementId: "G-G2CNDB08ZG" // Opcional mas recomendado
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // <-- Inicializa o serviço de Autenticação
const db = getFirestore(app); // <-- Inicializa o Firestore

console.log("Firebase App, Auth, Firestore inicializados (modo módulo).");

// --- Indicador de Loading ---
const loadingIndicator = document.createElement("div");
loadingIndicator.className = "loading-indicator";
loadingIndicator.textContent = "Carregando..."; // Adiciona um texto
// (Estilos como na resposta anterior - position fixed, centered, etc.)
loadingIndicator.style.display = 'none';
loadingIndicator.style.position = 'fixed'; /*...*/ // Adicione os outros estilos
document.body.appendChild(loadingIndicator);

function showLoading() {
    loadingIndicator.style.display = 'block';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}
// --- Fim Indicador de Loading ---


// --- Monitorar Estado de Autenticação ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Usuário logado:", user.uid);
        // Se estiver na página de login/cadastro E logado, redireciona
        const currentPage = window.location.pathname.split('/').pop(); // Pega o nome do arquivo (ex: login.html)
        if (currentPage === 'login.html' || currentPage === 'cadastro.html') {
             console.log("Usuário já logado, redirecionando para página principal...");
             // Defina para onde redirecionar após o login/se já estiver logado
             // window.location.href = '/dashboard.html'; // Exemplo
        }
    } else {
        console.log("Nenhum usuário logado.");
    }
});
// --- Fim Monitorar Estado ---


// Exporta o que será usado em outros módulos (login.js, cadastro.js, etc.)
export {
    auth,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword, // Exporta mesmo que não use aqui, para cadastro.js
    showLoading,
    hideLoading
};