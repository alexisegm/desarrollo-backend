import { authService, tokenService } from '../services/api.js';
import { syncViewState } from '../core/state.js';
import { clearAuthFeedback, getFriendlyErrorMessage, showAuthFeedback } from '../core/ui.js';

export function bindAuthHandlers(elements, dependencies = {}) {
  const { onSessionChanged = null } = dependencies;

  const refreshAfterAuth = async () => {
    clearAuthFeedback(elements.authFeedback);
    syncViewState(elements);

    if (typeof onSessionChanged === 'function') {
      await onSessionChanged();
    }
  };

  elements.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAuthFeedback(elements.authFeedback);

    const formData = new FormData(elements.loginForm);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const data = await authService.login(email, password);
      tokenService.setToken(data.accessToken);
      elements.loginForm.reset();
      await refreshAfterAuth();
    } catch (error) {
      const message = getFriendlyErrorMessage(error, () => {
        tokenService.removeToken();
        syncViewState(elements);
      });
      showAuthFeedback(elements.authFeedback, message);
    }
  });

  elements.registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAuthFeedback(elements.authFeedback);

    const formData = new FormData(elements.registerForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const data = await authService.register(name, email, password);

      if (data.accessToken) {
        tokenService.setToken(data.accessToken);
        elements.registerForm.reset();
        await refreshAfterAuth();
        return;
      }

      showAuthFeedback(elements.authFeedback, 'Cuenta creada exitosamente. Por favor, inicia sesión.', false);
      elements.authPanel.hidden = false;
      elements.registerForm.reset();
    } catch (error) {
      const message = getFriendlyErrorMessage(error, () => {
        tokenService.removeToken();
        syncViewState(elements);
      });
      showAuthFeedback(elements.authFeedback, message);
    }
  });

  elements.logoutBtn.addEventListener('click', () => {
    tokenService.removeToken();
    syncViewState(elements);
    if (typeof onSessionChanged === 'function') {
      onSessionChanged();
    }
  });

  return { onSessionChanged };
}
