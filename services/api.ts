import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const api = axios.create({
   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
   withCredentials: true 
});

let isRefreshing = false;
let failedQueue: Array<{
   resolve: (value: string) => void;
   reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
   failedQueue.forEach(prom => {
      if (error) {
         prom.reject(error);
      } else {
         prom.resolve(token as string);
      }
   });
   failedQueue = [];
};

api.interceptors.request.use(
   (config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
         const token = localStorage.getItem('authToken');
         if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
         }
      }
      return config;
   },
   (error: AxiosError) => {
      return Promise.reject(error);
   }
);

api.interceptors.response.use(
   (response: AxiosResponse) => response,
   async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Ignora 401 em rotas de auth para evitar loops
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
         return Promise.reject(error);
      }

      if (
         error.response?.status === 401 &&
         originalRequest && 
         !originalRequest._retry
      ) {
         if (isRefreshing) {
            return new Promise((resolve, reject) => {
               failedQueue.push({ resolve, reject });
            })
               .then((token) => {
                  if (originalRequest.headers) {
                     originalRequest.headers.Authorization = `Bearer ${token}`;
                  }
                  return api(originalRequest);
               })
               .catch((err) => {
                  return Promise.reject(err);
               });
         }

         originalRequest._retry = true;
         isRefreshing = true;

         try {
            // Chama endpoint de refresh (cookie enviado automaticamente via withCredentials)
            const { data } = await api.post('/auth/refresh');
            const { accessToken } = data;

            if (accessToken) {
               localStorage.setItem('authToken', accessToken);
               
               if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${accessToken}`;
               }
               
               processQueue(null, accessToken);
               return api(originalRequest);
            }
         } catch (refreshError) {
            processQueue(refreshError as Error, null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
         } finally {
            isRefreshing = false;
         }
      }

      return Promise.reject(error);
   }
);

// Remove duplicated default export and duplicated setoresApi definition already present at bottom
// We only need the interceptor logic and the exports from bottom


// API de Objetos
export const objetosApi = {
   listar: async (busca: string = "") => {
      const token = localStorage.getItem("authToken")
      const response = await api.get(`/objetos?busca=${busca}`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   criar: async (nome: string) => {
      const token = localStorage.getItem("authToken")
      const response = await api.post("/objetos", { nome }, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   renomear: async (id: number, nome: string) => {
      const token = localStorage.getItem("authToken")
      const response = await api.put(`/objetos/${id}`, { nome }, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   excluir: async (id: number) => {
      const token = localStorage.getItem("authToken")
      const response = await api.delete(`/objetos/${id}`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   contarUso: async (id: number) => {
      const token = localStorage.getItem("authToken")
      const response = await api.get(`/objetos/${id}/uso`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.count
   }
}

// API de Credores
export const credoresApi = {
   listar: async (busca: string = "") => {
      const token = localStorage.getItem("authToken")
      const response = await api.get(`/credores?busca=${busca}`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   criar: async (nome: string) => {
      const token = localStorage.getItem("authToken")
      const response = await api.post("/credores", { nome }, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   renomear: async (id: number, nome: string) => {
      const token = localStorage.getItem("authToken")
      const response = await api.put(`/credores/${id}`, { nome }, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   excluir: async (id: number) => {
      const token = localStorage.getItem("authToken")
      const response = await api.delete(`/credores/${id}`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   contarUso: async (id: number) => {
      const token = localStorage.getItem("authToken")
      const response = await api.get(`/credores/${id}/uso`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.count
   }
}

// API de Órgãos Geradores
export const orgaosGeradoresApi = {
   listar: async (busca: string = "") => {
      const token = localStorage.getItem("authToken")
      const response = await api.get(`/orgaos-geradores?busca=${busca}`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   criar: async (nome: string) => {
      const token = localStorage.getItem("authToken")
      const response = await api.post("/orgaos-geradores", { nome }, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   renomear: async (id: number, nome: string) => {
      const token = localStorage.getItem("authToken")
      const response = await api.put(`/orgaos-geradores/${id}`, { nome }, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   excluir: async (id: number) => {
      const token = localStorage.getItem("authToken")
      const response = await api.delete(`/orgaos-geradores/${id}`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   contarUso: async (id: number) => {
      const token = localStorage.getItem("authToken")
      const response = await api.get(`/orgaos-geradores/${id}/uso`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.count
   }
}

// API de Setores
export const setoresApi = {
   listar: async (busca: string = "") => {
      const token = localStorage.getItem("authToken")
      const response = await api.get(`/setores?busca=${busca}`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   criar: async (nome: string) => {
      const token = localStorage.getItem("authToken")
      const response = await api.post("/setores", { nome }, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   renomear: async (id: number, nome: string) => {
      const token = localStorage.getItem("authToken")
      const response = await api.put(`/setores/${id}`, { nome }, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   excluir: async (id: number) => {
      const token = localStorage.getItem("authToken")
      const response = await api.delete(`/setores/${id}`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
   },
   contarUso: async (id: number) => {
      const token = localStorage.getItem("authToken")
      const response = await api.get(`/setores/${id}/uso`, {
         headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.count
   }
}

export default api;