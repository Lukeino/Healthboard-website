import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Configurazione base di axios
axios.defaults.baseURL = API_BASE_URL;

// API per i pazienti
export const patientsAPI = {
  // Ottieni tutti i pazienti
  getAll: (params = {}) => {
    return axios.get('/patients', { params });
  },

  // Ottieni paziente per ID
  getById: (id) => {
    return axios.get(`/patients/${id}`);
  },

  // Crea nuovo paziente
  create: (patientData) => {
    return axios.post('/patients', patientData);
  },

  // Aggiorna paziente
  update: (id, patientData) => {
    return axios.put(`/patients/${id}`, patientData);
  },

  // Elimina paziente
  delete: (id) => {
    return axios.delete(`/patients/${id}`);
  },

  // Cerca pazienti
  search: (searchTerm) => {
    return axios.get('/patients', { 
      params: { search: searchTerm } 
    });
  }
};

// API per le visite
export const visitsAPI = {
  // Ottieni tutte le visite
  getAll: (params = {}) => {
    return axios.get('/visits', { params });
  },

  // Ottieni visite per paziente
  getByPatient: (patientId) => {
    return axios.get('/visits', { 
      params: { patient_id: patientId } 
    });
  },

  // Ottieni visita per ID
  getById: (id) => {
    return axios.get(`/visits/${id}`);
  },

  // Crea nuova visita
  create: (visitData) => {
    return axios.post('/visits', visitData);
  },

  // Aggiorna visita
  update: (id, visitData) => {
    return axios.put(`/visits/${id}`, visitData);
  },

  // Elimina visita
  delete: (id) => {
    return axios.delete(`/visits/${id}`);
  }
};

// API per l'autenticazione
export const authAPI = {
  login: (credentials) => {
    return axios.post('/auth/login', credentials);
  },

  register: (userData) => {
    return axios.post('/auth/register', userData);
  },

  verify: () => {
    return axios.get('/auth/verify');
  }
};

// Interceptor per gestire token JWT
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('healthboard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor per gestire errori globali
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token scaduto o non valido
      localStorage.removeItem('healthboard_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Esporta API consolidate
export const api = {
  patients: patientsAPI,
  visits: visitsAPI,
  auth: authAPI
};

export default axios;
