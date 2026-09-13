// frontend/app/services/api.js

const API_URL = import.meta.env.VITE_API_URL;

function ensureAuthenticated() {
    if (!tokenService.getToken()) {
        throw new ApiError(401, 'Tu sesión ha expirado o no estás autorizado. Vuelve a iniciar sesión.');
    }
}

export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

export const authService = {
  async login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const errorMsg = data.error?.message || data.message || 'Error al iniciar sesión';
            throw new ApiError(response.status, errorMsg);
        }
        return response.json(); 
    } catch (error) {
        if (error instanceof TypeError) {
            throw new ApiError(503, 'El servidor no está disponible o hay un error de red.');
        }
        throw error;
    }
  },

  async register(name, email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const errorMsg = data.error?.message || data.message || 'Error al registrar usuario';
            throw new ApiError(response.status, errorMsg);
        }
        return response.json();
    } catch (error) {
        if (error instanceof TypeError) {
            throw new ApiError(503, 'El servidor no está disponible o hay un error de red.');
        }
        throw error;
    }
  }
};

export const tokenService = {
    getToken: () => sessionStorage.getItem('token'),
    setToken: (token) => sessionStorage.setItem('token', token),
    removeToken: () => sessionStorage.removeItem('token'),
    
    getAuthHeaders: () => {
        const token = sessionStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

export const requestService = {
    async getRequests(queryString = '') {
        try {
            ensureAuthenticated();
            const response = await fetch(`${API_URL}/requests${queryString}`, {
                headers: tokenService.getAuthHeaders()
            });
            
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new ApiError(response.status, data.error?.message || data.message || `Error ${response.status}`);
            }
            return response.json();
        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiError(503, 'El servidor no está disponible o hay un error de red.');
            }
            throw error;
        }
    },

    async create(title, description) {
        try {
            ensureAuthenticated();
            const response = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...tokenService.getAuthHeaders()
                },
                body: JSON.stringify({ title, description })
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new ApiError(response.status, data.error?.message || data.message || 'Error al crear solicitud');
            }
            return response.json();
        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiError(503, 'El servidor no está disponible o hay un error de red.');
            }
            throw error;
        }
    },

    async getById(id) {
        try {
            ensureAuthenticated();
            const response = await fetch(`${API_URL}/requests/${id}`, {
                headers: tokenService.getAuthHeaders()
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new ApiError(response.status, data.error?.message || data.message || 'Error al obtener detalles');
            }
            return response.json();
        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiError(503, 'El servidor no está disponible o hay un error de red.');
            }
            throw error;
        }
    },

    async getHistory(id) {
        try {
            ensureAuthenticated();
            const response = await fetch(`${API_URL}/requests/${id}/history`, {
                headers: tokenService.getAuthHeaders()
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new ApiError(response.status, data.error?.message || data.message || 'Error al obtener el historial');
            }
            return response.json();
        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiError(503, 'El servidor no está disponible o hay un error de red.');
            }
            throw error;
        }
    },

    async update(id, title, description) {
        try {
            ensureAuthenticated();
            const response = await fetch(`${API_URL}/requests/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...tokenService.getAuthHeaders()
                },
                body: JSON.stringify({ title, description })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new ApiError(response.status, data.error?.message || data.message || 'Error al actualizar');
            }
            return response.json();
        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiError(503, 'El servidor no está disponible o hay un error de red.');
            }
            throw error;
        }
    },

    async manageByAgent(id, status, priority) {
        try {
            ensureAuthenticated();
            const response = await fetch(`${API_URL}/requests/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...tokenService.getAuthHeaders()
                },
                body: JSON.stringify({ status, priority })
            });
            
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const errorMsg = data.error?.message || data.message || 'Error al actualizar';
                throw new ApiError(response.status, errorMsg);
            }
            return response.json();
        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiError(503, 'El servidor no está disponible o hay un error de red.');
            }
            throw error;
        }
    }
};