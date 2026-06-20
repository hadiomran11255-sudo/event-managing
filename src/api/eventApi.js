import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getEvents = async () => {
  const { data } = await axios.get(`${API_URL}/events`);
  return data;
};

export const getEventByDate = async (date) => {
  const { data } = await axios.get(`${API_URL}/events/date/${date}`);
  return data;
};

export const createEvent = async (payload) => {
  const { data } = await axios.post(`${API_URL}/events`, payload);
  return data;
};

export const updateEvent = async (id, payload) => {
  const { data } = await axios.put(`${API_URL}/events/${id}`, payload);
  return data;
};

export const deleteEvent = async (id) => {
  const { data } = await axios.delete(`${API_URL}/events/${id}`);
  return data;
};

export const uploadPhoto = async (file) => {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await axios.post(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};
