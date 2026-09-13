import { authService, tokenService, requestService } from './services/api.js';

const authPanel = document.getElementById('auth-panel');
const requestsPanel = document.getElementById('requests-panel');
const requestDetailPanel = document.getElementById('request-detail-panel');
const backToListBtn = document.getElementById('back-to-list-btn');
const editRequestForm = document.getElementById('edit-request-form');
const editWarning = document.getElementById('edit-warning');
const requestHistoryList = document.getElementById('request-history-list');
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
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="font-size: 0.8rem; background: #2a2f3d; padding: 0.2rem 0.6rem; border-radius: 12px;">Prioridad: ${req.priority || 'N/A'}</span>
                        <span style="font-size: 0.8rem; background: #3d2a2f; color: #ff6b6b; padding: 0.2rem 0.6rem; border-radius: 12px;">Estado: ${req.status}</span>
                        <button onclick="openRequestDetail('${req.id}')" style="padding: 0.2rem 0.5rem; font-size: 0.85rem;">Ver Detalle</button>
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

// Exponer la función al contexto global para el onclick del HTML
window.openRequestDetail = async (id) => {
    try {
        const req = await requestService.getById(id);
        
        // Cambiar vista
        requestsPanel.hidden = true;
        requestDetailPanel.hidden = false;

        // Llenar datos
        document.getElementById('edit-request-id').value = req.id || req._id;
        document.getElementById('edit-title').value = req.title;
        document.getElementById('edit-description').value = req.description;
        document.getElementById('detail-status-badge').textContent = `Estado: ${req.status}`;

        // Lógica de bloqueo por estado (asumiendo que 'open' o 'pending' permite edición)
        const canEdit = req.status.toLowerCase() === 'open' || req.status.toLowerCase() === 'pending';
        document.getElementById('edit-title').disabled = !canEdit;
        document.getElementById('edit-description').disabled = !canEdit;
        document.getElementById('update-request-btn').hidden = !canEdit;
        editWarning.hidden = canEdit;

        // Cargar historial
        requestHistoryList.innerHTML = '';
        if (req.history && req.history.length > 0) {
            req.history.forEach(log => {
                const li = document.createElement('li');
                li.style.cssText = 'background: #1a1e2b; padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 4px; border-left: 3px solid #4da6ff; font-size: 0.85rem;';
                const date = new Date(log.createdAt || log.timestamp).toLocaleString();
                li.innerHTML = `<strong>${date}</strong>: ${log.action || log.message} por ${log.user || 'Sistema'}`;
                requestHistoryList.appendChild(li);
            });
        } else {
            requestHistoryList.innerHTML = '<li style="color: #a0a5b5; font-size: 0.9rem;">No hay historial registrado.</li>';
        }

    } catch (error) {
        alert(`Error al cargar detalles: ${error.message}`);
    }
};

// Volver a la lista
backToListBtn.addEventListener('click', () => {
    requestDetailPanel.hidden = true;
    requestsPanel.hidden = false;
    loadRequests(); // Recargar por si hubo cambios
});

// Guardar cambios
editRequestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-request-id').value;
    const title = document.getElementById('edit-title').value;
    const description = document.getElementById('edit-description').value;

    try {
        await requestService.update(id, title, description);
        alert('Solicitud actualizada correctamente');
        // Recargar los detalles para ver el nuevo historial
        window.openRequestDetail(id);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});