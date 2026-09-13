import { requestService, tokenService } from '../services/api.js';
import { priorityMap, statusMap, validTransitions } from '../core/constants.js';
import { ensureSession, syncViewState } from '../core/state.js';
import { getFriendlyErrorMessage, showAuthFeedback } from '../core/ui.js';

function buildHistoryItem(log) {
  const li = document.createElement('li');
  li.style.cssText = 'background: #1a1e2b; padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 4px; border-left: 3px solid #9b59b6; font-size: 0.85rem;';

  const date = log.changedAt ? new Date(log.changedAt).toLocaleString() : 'Fecha desconocida';
  let message = '';

  if (log.newStatus) {
    const displayNewStatus = statusMap[log.newStatus] || log.newStatus;
    if (!log.previousStatus) {
      message += `Solicitud creada en estado "${displayNewStatus}"`;
    } else if (log.newStatus !== log.previousStatus) {
      const displayPrevStatus = statusMap[log.previousStatus] || log.previousStatus;
      message += `Estado cambiado de "${displayPrevStatus}" a "${displayNewStatus}"`;
    }
  }

  if (log.newPriority && log.newPriority !== log.previousPriority) {
    const displayNewPriority = priorityMap[log.newPriority] || log.newPriority;
    if (message.length > 0) message += ' | ';

    if (!log.previousPriority) {
      message += `Prioridad establecida en "${displayNewPriority}"`;
    } else {
      const displayPrevPriority = priorityMap[log.previousPriority] || log.previousPriority;
      message += `Prioridad cambiada de "${displayPrevPriority}" a "${displayNewPriority}"`;
    }
  }

  if (!message) {
    return null;
  }

  li.innerHTML = `<strong>${date}</strong>: ${message} por ${log.changedBy || 'Sistema'}`;
  return li;
}

export function bindAgentHandlers(elements) {
  const loadAgentRequests = async () => {
    if (!ensureSession(elements)) {
      return;
    }

    elements.agentRequestsState.textContent = 'Cargando todas las solicitudes...';
    elements.agentRequestsState.style.color = '#98a0b3';
    elements.agentRequestsState.hidden = false;
    elements.agentRequestsList.innerHTML = '';

    const params = new URLSearchParams();
    if (elements.agentFilterStatus.value) params.append('status', elements.agentFilterStatus.value);
    if (elements.agentFilterPriority.value) params.append('priority', elements.agentFilterPriority.value);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
      const requests = await requestService.getRequests(queryString);

      if (requests.length === 0) {
        elements.agentRequestsState.textContent = 'No hay solicitudes en el sistema.';
        return;
      }

      elements.agentRequestsState.hidden = true;
      requests.forEach((req) => {
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
              <button type="button" class="agent-request-open-btn" data-request-id="${req.id || req._id}" style="padding: 0.2rem 0.5rem; font-size: 0.85rem; background: #9b59b6;">Gestionar</button>
            </div>
          </div>
          <p style="margin: 0; font-size: 0.9rem; color: #a0a5b5;">${req.description}</p>
        `;

        elements.agentRequestsList.appendChild(li);
      });

      elements.agentRequestsList.querySelectorAll('.agent-request-open-btn').forEach((button) => {
        button.addEventListener('click', () => {
          window.openAgentRequestDetail(button.dataset.requestId);
        });
      });
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error, () => {
        tokenService.removeToken();
        syncViewState(elements);
        showAuthFeedback(elements.authFeedback, 'Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión.');
      });
      elements.agentRequestsState.textContent = friendlyMessage;
      elements.agentRequestsState.style.color = '#ff6b6b';
      showAuthFeedback(elements.authFeedback, friendlyMessage);
    }
  };

  const openAgentRequestDetail = async (id) => {
    if (!ensureSession(elements)) {
      return;
    }

    try {
      const req = await requestService.getById(id);
      const historyData = await requestService.getHistory(id);

      elements.agentPanel.hidden = true;
      elements.agentRequestDetailPanel.hidden = false;
      elements.agentManageFeedback.hidden = true;

      const currentStatus = req.status.toLowerCase();
      const displayStatus = statusMap[currentStatus] || currentStatus;

      elements.agentManageRequestId.value = req.id || req._id;
      elements.agentCurrentStatus.value = currentStatus;
      elements.agentDetailTitle.textContent = req.title;
      elements.agentDetailDescription.textContent = req.description;
      elements.agentDetailStatusBadge.textContent = `Estado: ${displayStatus}`;
      elements.agentManagePriority.value = req.priority ? req.priority.toLowerCase() : 'low';

      elements.agentManageStatus.innerHTML = `<option value="${currentStatus}">Mantener actual (${displayStatus})</option>`;
      const availableTransitions = validTransitions[currentStatus] || [];
      availableTransitions.forEach((statusValue) => {
        const option = document.createElement('option');
        option.value = statusValue;
        option.textContent = `Cambiar a: ${statusMap[statusValue] || statusValue}`;
        elements.agentManageStatus.appendChild(option);
      });

      const isClosed = currentStatus === 'closed';
      elements.agentUpdateBtn.hidden = isClosed;
      elements.agentManagePriority.disabled = isClosed;
      elements.agentManageStatus.disabled = isClosed;

      const historyList = elements.agentRequestHistoryList;
      historyList.innerHTML = '';
      if (historyData && historyData.length > 0) {
        historyData.forEach((log) => {
          const item = buildHistoryItem(log);
          if (item) {
            historyList.appendChild(item);
          }
        });
      } else {
        historyList.innerHTML = '<li style="color: #a0a5b5; font-size: 0.9rem;">No hay historial registrado.</li>';
      }
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error, () => {
        tokenService.removeToken();
        syncViewState(elements);
        showAuthFeedback(elements.authFeedback, 'Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión.');
      });
      elements.agentRequestsState.textContent = friendlyMessage;
      elements.agentRequestsState.style.color = '#ff6b6b';
      elements.agentRequestsState.hidden = false;
      showAuthFeedback(elements.authFeedback, friendlyMessage);
    }
  };

  elements.agentApplyFiltersBtn.addEventListener('click', () => {
    if (!ensureSession(elements)) {
      return;
    }
    loadAgentRequests();
  });

  elements.agentBackToListBtn.addEventListener('click', () => {
    if (!ensureSession(elements)) {
      return;
    }

    elements.agentRequestDetailPanel.hidden = true;
    elements.agentPanel.hidden = false;
    loadAgentRequests();
  });

  elements.agentManageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!ensureSession(elements)) {
      return;
    }

    elements.agentManageFeedback.hidden = true;

    const id = elements.agentManageRequestId.value;
    const priority = elements.agentManagePriority.value;
    const status = elements.agentManageStatus.value;
    const currentStatus = elements.agentCurrentStatus.value;

    if (status === currentStatus && priority === elements.agentManagePriority.defaultValue) {
      return;
    }

    try {
      await requestService.manageByAgent(id, status, priority);
      syncViewState(elements);
      await openAgentRequestDetail(id);

      elements.agentManageFeedback.textContent = 'Actualización exitosa.';
      elements.agentManageFeedback.style.color = '#51cf66';
      elements.agentManageFeedback.hidden = false;

      setTimeout(() => {
        elements.agentManageFeedback.hidden = true;
      }, 4000);
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error, () => {
        tokenService.removeToken();
        syncViewState(elements);
        showAuthFeedback(elements.authFeedback, 'Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión.');
      });
      elements.agentManageFeedback.textContent = friendlyMessage;
      elements.agentManageFeedback.style.color = '#ff6b6b';
      elements.agentManageFeedback.hidden = false;
      showAuthFeedback(elements.authFeedback, friendlyMessage);
    }
  });

  window.openAgentRequestDetail = openAgentRequestDetail;

  return { loadAgentRequests, openAgentRequestDetail };
}
