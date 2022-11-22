import axios from 'axios';
console.log('VITE_APP_BASE_API', import.meta.env,);

const baseURL = import.meta.env.VITE_APP_BASE_API as string;

const defaultConfig = {
  timeout: 5000,
  baseURL
};
const axiosInstance = axios.create(defaultConfig);

// 请求拦截 
axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      // 如果有token， 就在请求头中携带
      config.headers.Authorization = token;
    } else {
      // config.headers.Authorization =
      //   'eyJhbGciOiJIUzUxMiIsImlhdCI6MTY1NTk3Mzk5NywiZXhwIjoxNjU2MDYwMzk3fQ.eyJpZCI6NTQwMDA5fQ.4SqCp_vvS1f6-AxAbQ4hNBjmhg_kGmAZs9TaVrnz3k5nzNptcuZsveORf6UfXxzkq58xQihD0Dbsg0K74c_yGw';
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);

// 响应拦截
axiosInstance.interceptors.response.use(
  config => {
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);

export default axiosInstance;
