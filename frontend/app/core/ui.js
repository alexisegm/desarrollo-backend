export function showFormFeedback(formElement, message, isError = true) {
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
    setTimeout(() => {
      feedbackEl.hidden = true;
    }, 4000);
  }
}

export function showAuthFeedback(element, message, isError = true) {
  element.textContent = message;
  element.classList.toggle('is-error', isError);
  element.classList.toggle('is-ok', !isError);
  element.hidden = false;
}

export function clearAuthFeedback(element) {
  element.textContent = '';
  element.classList.remove('is-error', 'is-ok');
  element.hidden = true;
}

export function getFriendlyErrorMessage(error, onUnauthorized = null) {
  let mensajeVisible = error.message || 'Ha ocurrido un error inesperado.';

  if (error.status) {
    switch (error.status) {
      case 400:
        mensajeVisible = 'Datos inválidos. Por favor verifica los campos.';
        break;
      case 401:
        mensajeVisible = 'Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión.';
        if (typeof onUnauthorized === 'function') {
          onUnauthorized();
        }
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
      default:
        mensajeVisible = error.message || `Error ${error.status}`;
    }
  }

  return mensajeVisible;
}
