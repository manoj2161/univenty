import { apiRequest } from "./apiClient";

export const fetchEvents = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/events?${query}` : `/events`;
  return await apiRequest(endpoint);
};

export const fetchEventById = async (id) => {
  return await apiRequest(`/events/${id}`);
};

export const createNewEvent = async (eventData) => {
  return await apiRequest("/events", {
    method: "POST",
    body: JSON.stringify(eventData),
  });
};

export const fetchOrganiserEvents = async () => {
  return await apiRequest("/events/organiser/my-events");
};

export const updateEventById = async (id, eventData) => {
  return await apiRequest(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(eventData),
  });
};

export const deleteEventById = async (id) => {
  return await apiRequest(`/events/${id}`, {
    method: "DELETE",
  });
};

// Aliases for compatibility
export const getEvents = fetchEvents;
export const getEventById = fetchEventById;
export const createEvent = createNewEvent;
export const getMyEvents = fetchOrganiserEvents;
