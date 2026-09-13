import { authService, tokenService, requestService } from './services/api.js';

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
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const applyFiltersBtn = document.getElementById('apply-filters-btn');

function showAuthFeedback(message, isError = true) {
    authFeedback.textContent = message;
    authFeedback.style.color = isError ? '#ff6b6b' : '#51cf66';
    authFeedback.hidden = false;
}

function clearAuthFeedback() {
    authFeedback.textContent = '';
    authFeedback.hidden = true;
}

function updateUI() {
    const token = tokenService.getToken();
    
    if (token) {
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
        authPanel.hidden = false;
        requestsPanel.hidden = true;
        logoutBtn.hidden = true;
        sessionUser.textContent = 'Sin sesión';
    }
}

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

logoutBtn.addEventListener('click', () => {
    tokenService.removeToken();
    updateUI();
});

async function loadRequests() {
    requestsState.textContent = 'Cargando solicitudes...';
    requestsState.hidden = false;
    requestsList.innerHTML = ''; 

    const params = new URLSearchParams();
    if (filterStatus.value) params.append('status', filterStatus.value);
    if (filterPriority.value) params.append('priority', filterPriority.value);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
        const requests = await requestService.getRequests(queryString);
        
        if (requests.length === 0) {
            requestsState.textContent = 'No hay solicitudes que coincidan con la búsqueda.';
            return;
        }

        requestsState.hidden = true; 
        
        requests.forEach(req => {
            const li = document.createElement('li');
            li.style.cssText = 'background: #161923; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; border: 1px solid #2a2f3d;';
            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong style="color: #4da6ff;">${req.title}</strong>
                    <div style="display: flex; gap: 0.5rem;">
                        <span style="font-size: 0.8rem; background: #2a2f3d; padding: 0.2rem 0.6rem; border-radius: 12px;">Prioridad: ${req.priority || 'N/A'}</span>
                        <span style="font-size: 0.8rem; background: #3d2a2f; color: #ff6b6b; padding: 0.2rem 0.6rem; border-radius: 12px;">Estado: ${req.status}</span>
                    </div>
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

const originalUpdateUI = updateUI;
updateUI = function() {
    originalUpdateUI();
    if (tokenService.getToken()) {
        loadRequests();
    }
};

createRequestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(createRequestForm);
    
    try {
        await requestService.create(
            formData.get('title'),
            formData.get('description')
        );
        createRequestForm.reset();
        await loadRequests();
    } catch (error) {
        alert(`Error: ${error.message}`); 
    }
});

document.addEventListener('DOMContentLoaded', () => {
    clearAuthFeedback();
    updateUI();
});
applyFiltersBtn.addEventListener('click', loadRequests);