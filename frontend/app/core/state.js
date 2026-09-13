import { tokenService } from '../services/api.js';
import { showAuthFeedback } from './ui.js';

export const appState = {
  userRole: null,
  currentRequestId: null
};

export function getTokenRole() {
  const token = tokenService.getToken();

  if (!token) {
    return null;
  }

  try {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    return decodedPayload.role || 'requester';
  } catch (error) {
    return null;
  }
}

export function syncViewState(elements) {
  const token = tokenService.getToken();

  if (token) {
    const userRole = getTokenRole();
    appState.userRole = userRole || 'requester';

    elements.authPanel.hidden = true;
    elements.logoutBtn.hidden = false;
    elements.sessionUser.textContent = `Rol: ${appState.userRole}`;

    if (appState.userRole === 'agent') {
      elements.requestsPanel.hidden = true;
      elements.agentPanel.hidden = false;
    } else {
      elements.requestsPanel.hidden = false;
      elements.agentPanel.hidden = true;
    }

    elements.requestDetailPanel.hidden = true;
    elements.agentRequestDetailPanel.hidden = true;
    return;
  }

  appState.userRole = null;
  elements.authPanel.hidden = false;
  elements.requestsPanel.hidden = true;
  elements.agentPanel.hidden = true;
  elements.requestDetailPanel.hidden = true;
  elements.agentRequestDetailPanel.hidden = true;
  elements.logoutBtn.hidden = true;
  elements.sessionUser.textContent = 'Sin sesión';
  elements.requestsState.hidden = true;
  elements.agentRequestsState.hidden = true;

  if (elements.authFeedback) {
    elements.authFeedback.textContent = '';
    elements.authFeedback.hidden = true;
  }
}

export function ensureSession(elements, options = {}) {
  const { message = 'Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión.' } = options;

  if (!tokenService.getToken()) {
    tokenService.removeToken();
    syncViewState(elements);
    showAuthFeedback(elements.authFeedback, message);
    return false;
  }

  return true;
}
