// frontend/app/main.js

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
const agentPanel = document.getElementById('agent-panel');
const agentFilterStatus = document.getElementById('agent-filter-status');
const agentFilterPriority = document.getElementById('agent-filter-priority');
const agentApplyFiltersBtn = document.getElementById('agent-apply-filters-btn');
const agentRequestsState = document.getElementById('agent-requests-state');
const agentRequestsList = document.getElementById('agent-requests-list');
const agentRequestDetailPanel = document.getElementById('agent-request-detail-panel');
const agentBackToListBtn = document.getElementById('agent-back-to-list-btn');
const agentManageForm = document.getElementById('agent-manage-form');
const agentManageStatus = document.getElementById('agent-manage-status');
const agentManageFeedback = document.getElementById('agent-manage-feedback');

const validTransitions = {
    'open': ['in_progress', 'resolved', 'closed'],
    'in_progress': ['resolved', 'closed'],
    'resolved': ['closed'],
    'closed': [] 
};

const statusMap = {
    'open': 'Abierto',
    'in_progress': 'En Progreso',
    'resolved': 'Resuelto',
    'closed': 'Cerrado'
};

const priorityMap = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta'
};

// Utilidad para evaluar códigos HTTP e inyectar mensajes específicos
function getFriendlyErrorMessage(error) {
    let mensajeVisible = error.message;

    if (error.status) {
        switch (error.status) {
            case 400:
                mensajeVisible = 'Datos inválidos. Por favor verifica los campos.';
                break;
            case 401:
                mensajeVisible = 'Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión.';
                tokenService.removeToken();
                updateUI();
                break;
            case 403:
                mensajeVisible = 'No tienes los permisos necesarios para esta acción.';
                break;
            case 404:
                mensajeVisible = 'El recurso solicitado no fue encontrado.';
                break;
            case 409:
                mensajeVisible = 'Conflicto de estado. La solicitud fue modificada recientemente o la transición no es permitida.';
                break;
            case 500:
                mensajeVisible = 'Error interno del servidor. Intenta más tarde.';
                break;
            case 503:
                mensajeVisible = 'Servidor inalcanzable. Revisa tu conexión a internet o intenta más tarde.';
                break;
        }
    }
    return mensajeVisible;
}

// Utilidad para inyectar feedback visual en cualquier formulario
function showFormFeedback(formElement, message, isError = true) {
    let feedbackEl = formElement.querySelector('.form-feedback');
    if (!feedbackEl) {
        feedbackEl = document.createElement('p');
        feedbackEl.className = 'form-feedback';
        feedbackEl.style.fontSize = '0.9rem';
        feedbackEl.style.marginTop = '0.5rem';
        formElement.appendChild(feedbackEl);
    }
    feedbackEl.textContent = message;
    feedbackEl.style.color = isError ? '#ff6b6b' : '#51cf66';
    feedbackEl.hidden = false;

    if (!isError) {
        setTimeout(() => { feedbackEl.hidden = true; }, 4000);
    }
}

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
        logoutBtn.hidden = false;
        
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            const userRole = decodedPayload.role || 'requester'; 
            
            sessionUser.textContent = `Rol: ${userRole}`;

            if (userRole === 'agent') {
                requestsPanel.hidden = true;
                agentPanel.hidden = false;
            } else {
                agentPanel.hidden = true;
                requestsPanel.hidden = false;
            }
            
        } catch (e) {
            sessionUser.textContent = 'Sesión Activa (Error leyendo rol)';
            requestsPanel.hidden = false;
            agentPanel.hidden = true;
        }
    } else {
        authPanel.hidden = false;
        requestsPanel.hidden = true;
        agentPanel.hidden = true;
        requestDetailPanel.hidden = true; 
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
        showAuthFeedback(getFriendlyErrorMessage(error));
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
        showAuthFeedback(getFriendlyErrorMessage(error));
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
            
            const displayStatus = statusMap[req.status] || req.status;
            const displayPriority = priorityMap[req.priority] || req.priority || 'N/A';

            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong style="color: #4da6ff;">${req.title}</strong>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="font-size: 0.8rem; background: #2a2f3d; padding: 0.2rem 0.6rem; border-radius: 12px;">Prioridad: ${displayPriority}</span>
                        <span style="font-size: 0.8rem; background: #3d2a2f; color: #ff6b6b; padding: 0.2rem 0.6rem; border-radius: 12px;">Estado: ${displayStatus}</span>
                        <button onclick="openRequestDetail('${req.id}')" style="padding: 0.2rem 0.5rem; font-size: 0.85rem;">Ver Detalle</button>
                    </div>
                </div>
                <p style="margin: 0; font-size: 0.9rem; color: #a0a5b5;">${req.description}</p>
            `;
            requestsList.appendChild(li);
        });
    } catch (error) {
        requestsState.textContent = getFriendlyErrorMessage(error);
        requestsState.style.color = '#ff6b6b';
    }
}

const originalUpdateUI = updateUI;
updateUI = function() {
    originalUpdateUI();
    const token = tokenService.getToken();
    if (token) {
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            if (decodedPayload.role === 'agent') {
                loadAgentRequests();
            } else {
                loadRequests();
            }
        } catch (e) {
            loadRequests();
        }
    }
};

createRequestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(createRequestForm);
    
    // Limpiar mensaje anterior si lo hay
    let existingFeedback = createRequestForm.querySelector('.form-feedback');
    if (existingFeedback) existingFeedback.hidden = true;

    try {
        await requestService.create(
            formData.get('title'),
            formData.get('description')
        );
        createRequestForm.reset();
        showFormFeedback(createRequestForm, 'Solicitud creada con éxito.', false);
        await loadRequests();
    } catch (error) {
        showFormFeedback(createRequestForm, getFriendlyErrorMessage(error));
    }
});

document.addEventListener('DOMContentLoaded', () => {
    clearAuthFeedback();
    updateUI();
});
applyFiltersBtn.addEventListener('click', loadRequests);

window.openRequestDetail = async (id) => {
    try {
        const req = await requestService.getById(id);
        const historyData = await requestService.getHistory(id);
        
        requestsPanel.hidden = true;
        requestDetailPanel.hidden = false;
        
        // Limpiar feedback del formulario de edición al abrir
        let existingFeedback = editRequestForm.querySelector('.form-feedback');
        if (existingFeedback) existingFeedback.hidden = true;

        const displayStatus = statusMap[req.status] || req.status;

        document.getElementById('edit-request-id').value = req.id || req._id;
        document.getElementById('edit-title').value = req.title;
        document.getElementById('edit-description').value = req.description;
        document.getElementById('detail-status-badge').textContent = `Estado: ${displayStatus}`;

        const canEdit = req.status.toLowerCase() === 'open' || req.status.toLowerCase() === 'pending';
        document.getElementById('edit-title').disabled = !canEdit;
        document.getElementById('edit-description').disabled = !canEdit;
        document.getElementById('update-request-btn').hidden = !canEdit;
        editWarning.hidden = canEdit;

        requestHistoryList.innerHTML = '';
        if (historyData && historyData.length > 0) {
            historyData.forEach(log => {
                const li = document.createElement('li');
                li.style.cssText = 'background: #1a1e2b; padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 4px; border-left: 3px solid #4da6ff; font-size: 0.85rem;';
                
                const date = log.changedAt ? new Date(log.changedAt).toLocaleString() : 'Fecha desconocida';
                const displayNew = statusMap[log.newStatus] || log.newStatus;
                
                let message;
                if (log.previousStatus === null) {
                    message = `Solicitud creada en estado "${displayNew}"`;
                } else {
                    const displayPrev = statusMap[log.previousStatus] || log.previousStatus;
                    message = `Estado cambiado de "${displayPrev}" a "${displayNew}"`;
                }

                li.innerHTML = `<strong>${date}</strong>: ${message} por ${log.changedBy || 'Sistema'}`;
                requestHistoryList.appendChild(li);
            });
        } else {
            requestHistoryList.innerHTML = '<li style="color: #a0a5b5; font-size: 0.9rem;">No hay historial registrado.</li>';
        }

    } catch (error) {
        requestsState.textContent = getFriendlyErrorMessage(error);
        requestsState.style.color = '#ff6b6b';
        requestsState.hidden = false;
    }
};

backToListBtn.addEventListener('click', () => {
    requestDetailPanel.hidden = true;
    requestsPanel.hidden = false;
    loadRequests(); 
});

editRequestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-request-id').value;
    const title = document.getElementById('edit-title').value;
    const description = document.getElementById('edit-description').value;

    try {
        await requestService.update(id, title, description);
        showFormFeedback(editRequestForm, 'Solicitud actualizada correctamente.', false);
        window.openRequestDetail(id);
    } catch (error) {
        showFormFeedback(editRequestForm, getFriendlyErrorMessage(error));
    }
});

async function loadAgentRequests() {
    agentRequestsState.textContent = 'Cargando todas las solicitudes...';
    agentRequestsState.hidden = false;
    agentRequestsList.innerHTML = ''; 

    const params = new URLSearchParams();
    if (agentFilterStatus.value) params.append('status', agentFilterStatus.value);
    if (agentFilterPriority.value) params.append('priority', agentFilterPriority.value);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
        const requests = await requestService.getRequests(queryString);
        
        if (requests.length === 0) {
            agentRequestsState.textContent = 'No hay solicitudes en el sistema.';
            return;
        }

        agentRequestsState.hidden = true; 
        
        requests.forEach(req => {
            const li = document.createElement('li');
            li.style.cssText = 'background: #161923; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; border: 1px solid #2a2f3d; border-left: 4px solid #9b59b6;';
            
            const displayStatus = statusMap[req.status] || req.status;
            const displayPriority = priorityMap[req.priority] || req.priority || 'N/A';

            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong style="color: #4da6ff;">${req.title}</strong>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="font-size: 0.8rem; background: #2a2f3d; padding: 0.2rem 0.6rem; border-radius: 12px;">Prioridad: ${displayPriority}</span>
                        <span style="font-size: 0.8rem; background: #3d2a2f; color: #ff6b6b; padding: 0.2rem 0.6rem; border-radius: 12px;">Estado: ${displayStatus}</span>
                        <button onclick="openAgentRequestDetail('${req.id || req._id}')" style="padding: 0.2rem 0.5rem; font-size: 0.85rem; background: #9b59b6;">Gestionar</button>
                    </div>
                </div>
                <p style="margin: 0; font-size: 0.9rem; color: #a0a5b5;">${req.description}</p>
            `;
            agentRequestsList.appendChild(li);
        });
    } catch (error) {
        agentRequestsState.textContent = getFriendlyErrorMessage(error);
        agentRequestsState.style.color = '#ff6b6b';
    }
}

agentApplyFiltersBtn.addEventListener('click', loadAgentRequests);

window.openAgentRequestDetail = async (id) => {
    try {
        const req = await requestService.getById(id);
        const historyData = await requestService.getHistory(id);
        
        agentPanel.hidden = true;
        agentRequestDetailPanel.hidden = false;
        agentManageFeedback.hidden = true;

        const currentStatus = req.status.toLowerCase();
        const displayStatus = statusMap[currentStatus] || currentStatus;

        document.getElementById('agent-manage-request-id').value = req.id || req._id;
        document.getElementById('agent-current-status').value = currentStatus;
        document.getElementById('agent-detail-title').textContent = req.title;
        document.getElementById('agent-detail-description').textContent = req.description;
        document.getElementById('agent-detail-status-badge').textContent = `Estado: ${displayStatus}`;
        
        document.getElementById('agent-manage-priority').value = req.priority ? req.priority.toLowerCase() : 'low';

        agentManageStatus.innerHTML = `<option value="${currentStatus}">Mantener actual (${displayStatus})</option>`;
        
        const availableTransitions = validTransitions[currentStatus] || [];
        availableTransitions.forEach(st => {
            const opt = document.createElement('option');
            opt.value = st;
            opt.textContent = `Cambiar a: ${statusMap[st] || st}`; 
            agentManageStatus.appendChild(opt);
        });

        const isClosed = currentStatus === 'closed';
        document.getElementById('agent-update-btn').hidden = isClosed;
        document.getElementById('agent-manage-priority').disabled = isClosed;
        agentManageStatus.disabled = isClosed;

        const historyList = document.getElementById('agent-request-history-list');
        historyList.innerHTML = '';
        if (historyData && historyData.length > 0) {
            historyData.forEach(log => {
                const li = document.createElement('li');
                li.style.cssText = 'background: #1a1e2b; padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 4px; border-left: 3px solid #9b59b6; font-size: 0.85rem;';
                
                const date = log.changedAt ? new Date(log.changedAt).toLocaleString() : 'Fecha desconocida';
                const displayNew = statusMap[log.newStatus] || log.newStatus;
                
                let message;
                if (log.previousStatus === null) {
                    message = `Solicitud creada en estado "${displayNew}"`;
                } else {
                    const displayPrev = statusMap[log.previousStatus] || log.previousStatus;
                    message = `Estado cambiado de "${displayPrev}" a "${displayNew}"`;
                }

                li.innerHTML = `<strong>${date}</strong>: ${message} por ${log.changedBy || 'Sistema'}`;
                historyList.appendChild(li);
            });
        } else {
            historyList.innerHTML = '<li style="color: #a0a5b5; font-size: 0.9rem;">No hay historial registrado.</li>';
        }

    } catch (error) {
        agentRequestsState.textContent = getFriendlyErrorMessage(error);
        agentRequestsState.style.color = '#ff6b6b';
        agentRequestsState.hidden = false;
    }
};

agentBackToListBtn.addEventListener('click', () => {
    agentRequestDetailPanel.hidden = true;
    agentPanel.hidden = false;
    loadAgentRequests();
});

agentManageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    agentManageFeedback.hidden = true;
    
    const id = document.getElementById('agent-manage-request-id').value;
    const priority = document.getElementById('agent-manage-priority').value;
    const status = agentManageStatus.value;
    const currentStatus = document.getElementById('agent-current-status').value;

    if (status === currentStatus && priority === document.getElementById('agent-manage-priority').defaultValue) {
        return; 
    }

    try {
        await requestService.manageByAgent(id, status, priority);
        
        agentManageFeedback.textContent = 'Actualización exitosa.';
        agentManageFeedback.style.color = '#51cf66';
        agentManageFeedback.hidden = false;
        
        await window.openAgentRequestDetail(id);
    } catch (error) {
        agentManageFeedback.textContent = getFriendlyErrorMessage(error);
        agentManageFeedback.style.color = '#ff6b6b';
        agentManageFeedback.hidden = false;
    }
});