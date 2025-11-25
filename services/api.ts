import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const local = 'http://localhost:3001'
const dev = 'http://143.198.98.233:3001'

const api = axios.create({
   baseURL: local,
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


      if (
         error.response?.status === 401 &&
         originalRequest && !originalRequest._retry
      ) {
         if (isRefreshing) {
            return new Promise((resolve, reject) => {
               failedQueue.push({ resolve, reject });
            })
               .then(token => {
                  if (originalRequest.headers) {
                     originalRequest.headers.Authorization = `Bearer ${token}`;
                  }
                  return api(originalRequest);
               })
               .catch(err => {
                  return Promise.reject(err);
               });
         }

         originalRequest._retry = true;
         isRefreshing = true;

         try {
            if (typeof window === 'undefined') {
               return Promise.reject(error);
            }

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
               throw new Error('Refresh token não encontrado');
            }

            const { data } = await axios.post<{
               accessToken: any;
            }>(
               'http://localhost:3001/auth/refresh'
               , { refreshToken }
            );

            const newToken = data.accessToken;
            console.log(newToken)
            localStorage.setItem('authToken', newToken);

            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            if (originalRequest.headers) {
               originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            processQueue(null, newToken);
            return api(originalRequest);

         } catch (refreshError: any) {
            processQueue(refreshError, null);
            console.error('Falha ao atualizar o token:', refreshError);

            if (typeof window !== 'undefined') {
               localStorage.removeItem('authToken');
               localStorage.removeItem('isAuthenticated');
               localStorage.removeItem('userEmail');
               localStorage.removeItem('userName');
               localStorage.removeItem('role');
               localStorage.removeItem('refreshToken')
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

export default api;