import { apiRequest, API_BASE_URL, getAuthToken } from "./apiClient";

export const registerForEvent = async (eventId, body = {}) => {
  return await apiRequest(`/registrations/${eventId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const fetchMyRegistrations = async () => {
  return await apiRequest("/registrations/my-registrations");
};

export const cancelRegistration = async (registrationId) => {
  return await apiRequest(`/registrations/${registrationId}/cancel`, { method: "DELETE" });
};

export const fetchEventRegistrations = async (eventId) => {
  return await apiRequest(`/registrations/event/${eventId}`);
};

export const reviewRegistrationStatus = async (registrationId, status, notes = "") => {
  return await apiRequest(`/registrations/${registrationId}/review`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes }),
  });
};

export const checkInByQR = async (qrToken) => {
  return await apiRequest("/registrations/checkin", {
    method: "PATCH",
    body: JSON.stringify({ qrToken }),
  });
};

// Returns a URL to trigger PDF download
export const getCertificateUrl = (registrationId) => {
  return `${API_BASE_URL}/registrations/${registrationId}/certificate`;
};

// Returns a URL to export CSV
export const getCSVExportUrl = (eventId) => {
  return `${API_BASE_URL}/registrations/event/${eventId}/export-csv`;
};
