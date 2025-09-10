import axios from "axios";

//axios instance with base URL from env
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE,
});

export default api;
