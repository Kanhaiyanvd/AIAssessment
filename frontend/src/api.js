import axios from "axios";

const BASE = "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const login = (username, password) =>
  api.post("/auth/login", { username, password }).then(r => r.data);

export const getBorrowers = () =>
  api.get("/borrowers").then(r => r.data);

export const getBorrower = id =>
  api.get(`/borrowers/${id}`).then(r => r.data);

export const explainBorrower = id =>
  api.get(`/borrowers/${id}/explain`).then(r => r.data);

export const queryBorrower = (id, question) =>
  api.post(`/borrowers/${id}/query`, { question }).then(r => r.data);

export const simulateBorrower = (id, scenario) =>
  api.post(`/borrowers/${id}/simulate`, { scenario }).then(r => r.data);

export const getPortfolioSummary = () =>
  api.get("/portfolio/summary").then(r => r.data);
