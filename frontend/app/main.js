// frontend/app/main.js
import { authService, tokenService, requestService } from './services/api.js';

// Referencias a los elementos del DOM (Actualizadas al diseño original)
const authPanel = document.getElementById('auth-panel');
const requestsPanel = document.getElementById('requests-panel');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const requestsState = document.getElementById('requests-state');
const requestsList = document.getElementById('requests-list');
const createRequestForm = document.getElementById('create-request-form');
const sessionUser = document.getElementById('session-user');
const authFeedback = document.getElementById('auth-feedback');

// Funciones para manejar feedback visual
function showAuthFeedback(message, isError = true) {
    authFeedback.textContent = message;
    authFeedback.style.color = isError ? '#ff6b6b' : '#51cf66';
    authFeedback.hidden = false;
}

function clearAuthFeedback() {
    authFeedback.textContent = '';
    authFeedback.hidden = true;
}

// Función para manejar el estado visual de la sesión usando el atributo 'hidden'
function updateUI() {
    const token = tokenService.getToken();
    
    if (token) {
        // Hay sesión activa
        authPanel.hidden = true;
        requestsPanel.hidden = false;
        logoutBtn.hidden = false;
        
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            sessionUser.textContent = `Rol: ${decodedPayload.role || 'Desconocido'}`;
        } catch (e) {
            sessionUser.textContent = 'Sesión Activa';
        }
    } else {
        // No hay sesión
        authPanel.hidden = false;
        requestsPanel.hidden = true;
        logoutBtn.hidden = true;
        sessionUser.textContent = 'Sin sesión';
    }
}

// Manejo del Login usando FormData (más limpio ya que los inputs no tienen ID sino 'name')
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthFeedback();
    
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        const data = await authService.login(email, password);
        tokenService.setToken(data.accessToken);
        updateUI();
        loginForm.reset();
    } catch (error) {
        showAuthFeedback(`Error: ${error.message}`);
    }
});

// Manejo del Registro
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthFeedback();

    const formData = new FormData(registerForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    

    try {
        const data = await authService.register(name, email, password);
        if (data.accessToken) {
         tokenService.setToken(data.accessToken);
        updateUI();
        } else {
            showAuthFeedback('Cuenta creada exitosamente. Por favor, inicia sesión.', false);
            authPanel.hidden = false;
        }
        registerForm.reset();
    } catch (error) {
        showAuthFeedback(`${error.message}`);
    }
});

// Manejo del Logout Local
logoutBtn.addEventListener('click', () => {
    tokenService.removeToken();
    updateUI();
});

// Funcion para cargar y renderizar las solicitudes
async function loadRequests() {
    requestsState.textContent = 'Cargando solicitudes...';
    requestsState.hidden = false;
    requestsList.innerHTML = ''; // Limpiar lista actual
    try {
        const requests = await requestService.getRequests();
        if (requests.length === 0) {
            requestsState.textContent = 'No tienes solicitudes creadas.';
            return;
        }
        requestsState.hidden = true; // Ocultar mensaje de estado si hay datos
        requests.forEach(req => {
          const li = document.createElement('li');
            li.style.cssText = 'background: #161923; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; border: 1px solid #2a2f3d;';
            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong style="color: #4da6ff;">${req.title}</strong>
                    <span style="font-size: 0.8rem; background: #2a2f3d; padding: 0.2rem 0.6rem; border-radius: 12px;">Estado: ${req.status}</span>
                </div>
                <p style="margin: 0; font-size: 0.9rem; color: #a0a5b5;">${req.description}</p>
            `;
            requestsList.appendChild(li);
        });
    } catch (error) {
        requestsState.textContent = `Error al cargar: ${error.message}`;
        requestsState.style.color = '#ff6b6b';
    }
}

// Interceptar el cambio de UI para cargar solicitudes cuando se inicie sesión
const originalUpdateUI = updateUI;
updateUI = function() {
    originalUpdateUI();
    if (tokenService.getToken()) {
        loadRequests();
    }
};

// Manejo de creación de solicitud
createRequestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(createRequestForm);
    
    try {
        await requestService.create(
            formData.get('title'),
            formData.get('description')
        );
        createRequestForm.reset();
        await loadRequests(); // Recargar la lista para ver la nueva solicitud
    } catch (error) {
        alert(`Error: ${error.message}`); // Temporal, lo mejoraremos en el paso de errores
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    clearAuthFeedback();
    updateUI();
});