import { bindAgentHandlers } from './features/agent.js';
import { bindAuthHandlers } from './features/auth.js';
import { bindRequesterHandlers } from './features/requests.js';
import { appState, getTokenRole, syncViewState } from './core/state.js';

const elements = {
  authPanel: document.getElementById('auth-panel'),
  requestsPanel: document.getElementById('requests-panel'),
  requestDetailPanel: document.getElementById('request-detail-panel'),
  backToListBtn: document.getElementById('back-to-list-btn'),
  editRequestForm: document.getElementById('edit-request-form'),
  editWarning: document.getElementById('edit-warning'),
  requestHistoryList: document.getElementById('request-history-list'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  logoutBtn: document.getElementById('logout-btn'),
  requestsState: document.getElementById('requests-state'),
  requestsList: document.getElementById('requests-list'),
  createRequestForm: document.getElementById('create-request-form'),
  sessionUser: document.getElementById('session-user'),
  authFeedback: document.getElementById('auth-feedback'),
  filterStatus: document.getElementById('filter-status'),
  filterPriority: document.getElementById('filter-priority'),
  applyFiltersBtn: document.getElementById('apply-filters-btn'),
  agentPanel: document.getElementById('agent-panel'),
  agentFilterStatus: document.getElementById('agent-filter-status'),
  agentFilterPriority: document.getElementById('agent-filter-priority'),
  agentApplyFiltersBtn: document.getElementById('agent-apply-filters-btn'),
  agentRequestsState: document.getElementById('agent-requests-state'),
  agentRequestsList: document.getElementById('agent-requests-list'),
  agentRequestDetailPanel: document.getElementById('agent-request-detail-panel'),
  agentBackToListBtn: document.getElementById('agent-back-to-list-btn'),
  agentManageForm: document.getElementById('agent-manage-form'),
  agentManageStatus: document.getElementById('agent-manage-status'),
  agentManageFeedback: document.getElementById('agent-manage-feedback'),
  editRequestId: document.getElementById('edit-request-id'),
  editTitle: document.getElementById('edit-title'),
  editDescription: document.getElementById('edit-description'),
  detailStatusBadge: document.getElementById('detail-status-badge'),
  updateRequestBtn: document.getElementById('update-request-btn'),
  agentManageRequestId: document.getElementById('agent-manage-request-id'),
  agentCurrentStatus: document.getElementById('agent-current-status'),
  agentDetailTitle: document.getElementById('agent-detail-title'),
  agentDetailDescription: document.getElementById('agent-detail-description'),
  agentDetailStatusBadge: document.getElementById('agent-detail-status-badge'),
  agentManagePriority: document.getElementById('agent-manage-priority'),
  agentUpdateBtn: document.getElementById('agent-update-btn'),
  agentRequestHistoryList: document.getElementById('agent-request-history-list')
};

async function initializeApp() {
  const requesterView = bindRequesterHandlers(elements, { appState });
  const agentView = bindAgentHandlers(elements);

  const reloadCurrentView = async () => {
    const role = getTokenRole();

    if (role === 'agent') {
      await agentView.loadAgentRequests();
      return;
    }

    if (role) {
      await requesterView.loadRequests();
      return;
    }

    elements.requestsState.hidden = true;
    elements.agentRequestsState.hidden = true;
  };

  bindAuthHandlers(elements, { onSessionChanged: reloadCurrentView });
  syncViewState(elements);
  await reloadCurrentView();
}

document.addEventListener('DOMContentLoaded', initializeApp);