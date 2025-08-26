import axios from "axios";
console.log(process.env);
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Replace with your actual API domain
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
