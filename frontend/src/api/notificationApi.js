import { apiRequest } from "./apiClient";

export const fetchNotifications = () => apiRequest("/notifications");
export const markNotificationRead = (id) => apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
export const markAllRead = () => apiRequest("/notifications/read-all", { method: "PATCH" });
export const deleteNotification = (id) => apiRequest(`/notifications/${id}`, { method: "DELETE" });
