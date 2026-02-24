import axios from "axios";

const API_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
});

// ===== Seniors =====
export const getSeniors = () => api.get("/seniors");

export const saveSenior = (senior) => {
  if (senior.id) {
    return api.put(`/seniors/${senior.id}`, senior);
  } else {
    return api.post("/seniors", senior);
  }
};

export const deleteSenior = (seniorId) => api.delete(`/seniors/${seniorId}`);

// ===== Medications =====
export const getMedications = (seniorId) => api.get(`/medications/${seniorId}`);

export const saveMedication = (medication) => {
  if (medication.id) {
    return api.put(`/medication/${medication.id}`, medication);
  } else {
    return api.post("/medications", medication);
  }
};

export const deleteMedication = (medId) => api.delete(`/medication/${medId}`);
//  taken=true
export const logMedication = (medicationId, taken=true ,skipReason ) =>
  api.post(`/medications/${medicationId}/log`, { taken ,skipReason});

// ===== Today’s Logs =====
export const getTodayLogs = (seniorId) =>
  api.get(`/medication-logs/today/${seniorId}`);

// ===== Mark medication taken (helper) =====
export const logMedicationTaken = (medicationId) =>
  api.post(`/medications/${medicationId}/log`, { taken: true });

// ===== Notifications =====
export const getNotifications = (seniorId) =>
  api.get(`/notifications/${seniorId}`);

export const markNotificationRead = (id) =>
  api.post(`/notifications/${id}/read`);


api.interceptors.request.use((config) => {
  if (localStorage.getItem("adminVerified") === "true") {
    config.headers["X-Admin-Verified"] = "true";
  }
  return config;
});
export default api;
