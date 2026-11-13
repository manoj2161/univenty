import { apiRequest } from "./apiClient";

export const fetchEventReviews = (eventId) => apiRequest(`/events/${eventId}/reviews`);
export const submitReview = (eventId, data) =>
  apiRequest(`/events/${eventId}/reviews`, { method: "POST", body: JSON.stringify(data) });

export const fetchMyBookmarks = () => apiRequest("/events/my-bookmarks");
export const toggleBookmark = (eventId) =>
  apiRequest(`/events/${eventId}/bookmark`, { method: "POST" });
