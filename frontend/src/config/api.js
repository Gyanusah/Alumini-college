// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  GET_ME: `${API_BASE_URL}/api/auth/me`,
  UPDATE_DETAILS: `${API_BASE_URL}/api/auth/updatedetails`,
  UPDATE_PASSWORD: `${API_BASE_URL}/api/auth/updatepassword`,
  
  // Users
  USERS: `${API_BASE_URL}/api/users`,
  USER_BY_ID: (id) => `${API_BASE_URL}/api/users/${id}`,
  ALL_USERS: `${API_BASE_URL}/api/users/user`,
  VERIFY_USER: (id) => `${API_BASE_URL}/api/users/${id}/verify`,
  UNVERIFY_USER: (id) => `${API_BASE_URL}/api/users/${id}/unverify`,
  CREATE_ADMIN: `${API_BASE_URL}/api/users/create-admin`,
  
  // Alumni
  ALUMNI: `${API_BASE_URL}/api/alumni`,
  ALUMNI_BY_ID: (id) => `${API_BASE_URL}/api/alumni/${id}`,
  
  // Jobs
  JOBS: `${API_BASE_URL}/api/jobs`,
  JOB_BY_ID: (id) => `${API_BASE_URL}/api/jobs/${id}`,
  APPLY_JOB: (id) => `${API_BASE_URL}/api/jobs/${id}/apply`,
  
  // Events
  EVENTS: `${API_BASE_URL}/api/events`,
  EVENT_BY_ID: (id) => `${API_BASE_URL}/api/events/${id}`,
  REGISTER_EVENT: (id) => `${API_BASE_URL}/api/events/${id}/register`,
  APPROVE_EVENT: (id) => `${API_BASE_URL}/api/events/${id}/approve`,
  
  // Connections
  CONNECTIONS: `${API_BASE_URL}/api/connections`,
  CONNECTION_BY_ID: (id) => `${API_BASE_URL}/api/connections/${id}`,
  CONNECTION_ACTION: (id, action) => `${API_BASE_URL}/api/connections/${id}/${action}`,
  ACCEPT_CONNECTION: (id) => `${API_BASE_URL}/api/connections/${id}/accept`,
  REJECT_CONNECTION: (id) => `${API_BASE_URL}/api/connections/${id}/reject`,

  // Stats
  RECENT_ACTIVITY: `${API_BASE_URL}/api/stats/recent-activity`,
  DASHBOARD_STATS: `${API_BASE_URL}/api/stats/dashboard`,
};

export default API_ENDPOINTS;
