// login.js

// Importa o necessário do app.js
import { auth, signInWithEmailAndPassword, showLoading, hideLoading } from './app.js';

// Pega a referência para o div de mensagens de erro
const errorMessageDiv = document.getElementById('error-message');

// Define a função de login e a anexa ao objeto window para ser acessível pelo onsubmit
window.login = async () => {
    // Pega os valores dos inputs
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('senha'); // Usa o ID correto 'senha'
    const email = emailInput.value.trim(); // Remove espaços extras
    const password = passwordInput.value;

    // Limpa mensagens de erro anteriores
    errorMessageDiv.textContent = '';

    // Validação básica (opcional, mas útil)
    if (!email || !password) {
        errorMessageDiv.textContent = 'Por favor, preencha email e senha.';
        return; // Para a execução se campos estiverem vazios
    }

    showLoading(); // Mostra o indicador

    try {
        // Tenta fazer o login com Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Login bem-sucedido!
        console.log("Login realizado com sucesso:", userCredential.user);
        window.location.href = 'index.html'; // Redireciona para a página principal
        errorMessageDiv.textContent = ''; // Limpa qualquer erro residual
        alert("Login bem-sucedido!"); // Feedback simples

        // *** Redirecionamento após sucesso ***
        // Descomente e ajuste a linha abaixo para redirecionar o usuário
        // window.location.href = '/pagina-principal.html'; // Ou '/dashboard.html', etc.

    } catch (error) {
        // Ocorreu um erro durante o login
        console.error("Erro no login:", error.code, error.message);

        // Mostra uma mensagem de erro mais amigável
        let friendlyMessage = 'Ocorreu um erro ao tentar fazer login.';
        switch (error.code) {
            case 'auth/invalid-email':
                friendlyMessage = 'O formato do email é inválido.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password': // Combine user-not-found e wrong-password por segurança
            case 'auth/invalid-credential': // Erro mais genérico a partir de versões recentes
                friendlyMessage = 'Email ou senha incorretos.';
                break;
            case 'auth/too-many-requests':
                friendlyMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
                break;
            default:
                friendlyMessage = 'Erro ao fazer login. Verifique sua conexão ou tente mais tarde.';
        }
        errorMessageDiv.textContent = friendlyMessage;

    } finally {
        // Garante que o indicador de loading seja escondido, mesmo se der erro
        hideLoading();
    }
};