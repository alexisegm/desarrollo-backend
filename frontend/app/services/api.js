
const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMsg = data.error?.message || data.message || 'Error al iniciar sesión';
        throw new Error(errorMsg);
    }
    return response.json(); 
  },

  async register(name, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMsg = data.error?.message || data.message || 'Error al registrar usuario';
        throw new Error(errorMsg);
    }
    return response.json();
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
        const response = await fetch(`${API_URL}/requests${queryString}`, {
            headers: tokenService.getAuthHeaders()
        });
        
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error?.message || data.message || `Error ${response.status}`);
        }
        return response.json();
    },

    async create(title, description) {
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
            throw new Error(data.error?.message || data.message || 'Error al crear solicitud');
        }
        return response.json();
    },

    async getById(id) {
        const response = await fetch(`${API_URL}/requests/${id}`, {
            headers: tokenService.getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener detalles');
        return response.json();
    },

    async getHistory(id) {
        const response = await fetch(`${API_URL}/requests/${id}/history`, {
            headers: tokenService.getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener el historial');
        return response.json();
    },

    async update(id, title, description) {
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
            throw new Error(data.error?.message || data.message || 'Error al actualizar');
        }
        return response.json();

    },

    async manageByAgent(id, status, priority) {
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

            if (response.status === 409) {
                throw new Error('Conflicto: Transición de estado no permitida.');   
        }
            throw new Error(errorMsg);
        }
        return response.json();
    }
};