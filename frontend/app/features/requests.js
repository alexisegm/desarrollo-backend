import { requestService, tokenService } from '../services/api.js';
import { priorityMap, statusMap } from '../core/constants.js';
import { ensureSession, syncViewState } from '../core/state.js';
import { getFriendlyErrorMessage, showAuthFeedback, showFormFeedback } from '../core/ui.js';

function buildRequestRow(request) {
  const li = document.createElement('li');
  li.style.cssText = 'background: #161923; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; border: 1px solid #2a2f3d;';

  const displayStatus = statusMap[request.status] || request.status;
  const displayPriority = priorityMap[request.priority] || request.priority || 'N/A';

  li.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
      <strong style="color: #4da6ff;">${request.title}</strong>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <span style="font-size: 0.8rem; background: #2a2f3d; padding: 0.2rem 0.6rem; border-radius: 12px;">Prioridad: ${displayPriority}</span>
        <span style="font-size: 0.8rem; background: #3d2a2f; color: #ff6b6b; padding: 0.2rem 0.6rem; border-radius: 12px;">Estado: ${displayStatus}</span>
        <button type="button" data-request-id="${request.id || request._id}" class="request-open-btn" style="padding: 0.2rem 0.5rem; font-size: 0.85rem;">Ver Detalle</button>
      </div>
    </div>
    <p style="margin: 0; font-size: 0.9rem; color: #a0a5b5;">${request.description}</p>
  `;

  return li;
}

function buildHistoryItem(log, mode = 'requester') {
  const li = document.createElement('li');
  li.style.cssText = mode === 'agent'
    ? 'background: #1a1e2b; padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 4px; border-left: 3px solid #9b59b6; font-size: 0.85rem;'
    : 'background: #1a1e2b; padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 4px; border-left: 3px solid #4da6ff; font-size: 0.85rem;';

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

export function bindRequesterHandlers(elements, dependencies) {
  const { appState } = dependencies;

  const loadRequests = async () => {
    if (!ensureSession(elements)) {
      return;
    }

    elements.requestsState.textContent = 'Cargando solicitudes...';
    elements.requestsState.style.color = '#98a0b3';
    elements.requestsState.hidden = false;
    elements.requestsList.innerHTML = '';

    const params = new URLSearchParams();
    if (elements.filterStatus.value) params.append('status', elements.filterStatus.value);
    if (elements.filterPriority.value) params.append('priority', elements.filterPriority.value);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
      const requests = await requestService.getRequests(queryString);

      if (requests.length === 0) {
        elements.requestsState.textContent = 'No hay solicitudes que coincidan con la búsqueda.';
        return;
      }

      elements.requestsState.hidden = true;
      requests.forEach((req) => {
        elements.requestsList.appendChild(buildRequestRow(req));
      });

      elements.requestsList.querySelectorAll('.request-open-btn').forEach((button) => {
        button.addEventListener('click', () => {
          window.openRequestDetail(button.dataset.requestId);
        });
      });
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error, () => {
        tokenService.removeToken();
        syncViewState(elements);
        showAuthFeedback(elements.authFeedback, 'Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión.');
      });
      elements.requestsState.textContent = friendlyMessage;
      elements.requestsState.style.color = '#ff6b6b';
      showAuthFeedback(elements.authFeedback, friendlyMessage);
    }
  };

  const openRequestDetail = async (id, options = {}) => {
    const { preserveFeedback = false } = options;

    if (!ensureSession(elements)) {
      return;
    }

    try {
      const req = await requestService.getById(id);
      const historyData = await requestService.getHistory(id);

      elements.requestsPanel.hidden = true;
      elements.requestDetailPanel.hidden = false;

      if (!preserveFeedback) {
        const existingFeedback = elements.editRequestForm.querySelector('.form-feedback');
        if (existingFeedback) {
          existingFeedback.hidden = true;
        }
      }

      const currentStatus = req.status ? req.status.toLowerCase() : '';
      const displayStatus = statusMap[currentStatus] || currentStatus;

      elements.editRequestId.value = req.id || req._id;
      elements.editTitle.value = req.title;
      elements.editDescription.value = req.description;
      elements.detailStatusBadge.textContent = `Estado: ${displayStatus}`;

      const canEdit = currentStatus === 'open' || currentStatus === 'pending';
      elements.editTitle.disabled = !canEdit;
      elements.editDescription.disabled = !canEdit;
      elements.updateRequestBtn.hidden = !canEdit;
      elements.editWarning.hidden = canEdit;

      elements.requestHistoryList.innerHTML = '';
      if (historyData && historyData.length > 0) {
        historyData.forEach((log) => {
          const item = buildHistoryItem(log);
          if (item) {
            elements.requestHistoryList.appendChild(item);
          }
        });
      } else {
        elements.requestHistoryList.innerHTML = '<li style="color: #a0a5b5; font-size: 0.9rem;">No hay historial registrado.</li>';
      }

      appState.currentRequestId = id;
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error, () => {
        tokenService.removeToken();
        syncViewState(elements);
        showAuthFeedback(elements.authFeedback, 'Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión.');
      });
      elements.requestsState.textContent = friendlyMessage;
      elements.requestsState.style.color = '#ff6b6b';
      elements.requestsState.hidden = false;
      showAuthFeedback(elements.authFeedback, friendlyMessage);
    }
  };

  elements.applyFiltersBtn.addEventListener('click', loadRequests);

  elements.createRequestForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!ensureSession(elements)) {
      return;
    }

    const formData = new FormData(elements.createRequestForm);

    const existingFeedback = elements.createRequestForm.querySelector('.form-feedback');
    if (existingFeedback) {
      existingFeedback.hidden = true;
    }

    try {
      await requestService.create(formData.get('title'), formData.get('description'));
      elements.createRequestForm.reset();
      showFormFeedback(elements.createRequestForm, 'Solicitud creada con éxito.', false);
      await loadRequests();
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error, () => {
        tokenService.removeToken();
        syncViewState(elements);
        showAuthFeedback(elements.authFeedback, 'Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión.');
      });
      showFormFeedback(elements.createRequestForm, friendlyMessage);
    }
  });

  elements.backToListBtn.addEventListener('click', () => {
    if (!ensureSession(elements)) {
      return;
    }

    elements.requestDetailPanel.hidden = true;
    elements.requestsPanel.hidden = false;
    loadRequests();
  });

  elements.editRequestForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!ensureSession(elements)) {
      return;
    }

    const id = elements.editRequestId.value;
    const title = elements.editTitle.value;
    const description = elements.editDescription.value;

    try {
      await requestService.update(id, title, description);
      showFormFeedback(elements.editRequestForm, 'Solicitud actualizada correctamente.', false);
      setTimeout(() => {
        openRequestDetail(id, { preserveFeedback: true });
      }, 250);
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error, () => {
        tokenService.removeToken();
        syncViewState(elements);
        showAuthFeedback(elements.authFeedback, 'Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión.');
      });
      showFormFeedback(elements.editRequestForm, friendlyMessage);
    }
  });

  window.openRequestDetail = openRequestDetail;

  return { loadRequests, openRequestDetail };
}
