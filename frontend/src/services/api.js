import axios from "axios";

// 🔧 Create Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // change to true if using cookies
});

// 🔐 Request Interceptor → Attach Token
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🚨 Response Interceptor → Handle Errors Globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;

    // 🔥 Auto logout if token expired
    if (status === 401) {
      console.warn("🔐 Session expired. Logging out...");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Optional: redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;