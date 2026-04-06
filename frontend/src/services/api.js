import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Books & Bundles
export const getBooks = () => api.get('/books');
export const getBooksByClass = (className) => api.get(`/books/class/${className}`);
export const getBundles = () => api.get('/books/bundles');
export const getBundlesByClass = (className) => api.get(`/books/bundles/class/${className}`);

// Sales
export const createSale = (saleData) => api.post('/sales', saleData);
export const getAllSales = () => api.get('/sales');
export const getSalesMetrics = () => api.get('/sales/metrics');
export const updateDeliveryStatus = (id, status) => api.patch(`/sales/${id}/delivery`, { delivered_status: status });

// PDF/CSV Ingestion
export const uploadPDF = (formData) => api.post('/pdf/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default api;
