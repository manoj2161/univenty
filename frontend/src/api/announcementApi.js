import { apiRequest } from "./apiClient";

export const fetchAnnouncements = () => apiRequest("/announcements");

// Admin
export const fetchAdminAnnouncements = () => apiRequest("/admin/announcements");
export const createAnnouncement = (data) =>
  apiRequest("/admin/announcements", { method: "POST", body: JSON.stringify(data) });
export const toggleAnnouncement = (id) =>
  apiRequest(`/admin/announcements/${id}/toggle`, { method: "PATCH" });
export const deleteAnnouncement = (id) =>
  apiRequest(`/admin/announcements/${id}`, { method: "DELETE" });

// Analytics
export const fetchAnalytics = () => apiRequest("/admin/analytics");
