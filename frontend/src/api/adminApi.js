import { apiRequest } from "./apiClient";

export const fetchAdminStats = async () => {
  return await apiRequest("/admin/stats");
};

export const fetchAdminUsers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await apiRequest(query ? `/admin/users?${query}` : "/admin/users");
};

export const fetchAdminUser = async (id) => {
  return await apiRequest(`/admin/users/${id}`);
};

export const updateAdminUser = async (id, userData) => {
  return await apiRequest(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
};

export const blockAdminUser = async (id, reason) => {
  return await apiRequest(`/admin/users/${id}/block`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
};

export const unblockAdminUser = async (id) => {
  return await apiRequest(`/admin/users/${id}/unblock`, {
    method: "POST",
  });
};

export const fetchAdminEvents = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await apiRequest(query ? `/admin/events?${query}` : "/admin/events");
};

export const reviewAdminEvent = async (id, status, reason = "") => {
  return await apiRequest(`/admin/events/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
  });
};

export const updateAdminEvent = async (id, eventData) => {
  return await apiRequest(`/admin/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(eventData),
  });
};

export const deleteAdminEvent = async (id) => {
  return await apiRequest(`/admin/events/${id}`, {
    method: "DELETE",
  });
};

export const issueCertificates = async (eventId) => {
  return await apiRequest(`/registrations/event/${eventId}/issue-certificates`, {
    method: "POST",
  });
};

export const fetchAdminRegistrations = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await apiRequest(query ? `/admin/registrations?${query}` : "/admin/registrations");
};

export const reviewAdminRegistration = async (id, status, notes = "") => {
  return await apiRequest(`/admin/registrations/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes }),
  });
};

export const cancelAdminRegistration = async (id) => {
  return await apiRequest(`/admin/registrations/${id}`, {
    method: "DELETE",
  });
};

export const fetchAdminLogs = async () => {
  return await apiRequest("/admin/logs");
};
