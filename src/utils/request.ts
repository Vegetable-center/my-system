import axios from 'axios';
import { ElMessage } from 'element-plus'; // Vue 组件库提示，可替换为其他UI库
import router from '@/router'; // 路由实例（Vue/React Router）

// 创建 Axios 实例
const service = axios.create({
  baseURL: '/api', // 后端接口前缀（环境变量）
  timeout: 10000, // 请求超时时间
});

// 【请求拦截器】统一添加 Token
service.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ Token 不存在，未添加 Authorization 头');
    }
    return config;
  },
  (error) => {
    console.error('❌ 请求拦截器报错:', error);
    // 请求错误预处理
    Promise.reject(error);
  }
);

// 【响应拦截器】统一处理 Token 失效
service.interceptors.response.use(
  (response) => {
    // 正常响应：直接返回数据
    return response.data;
  },
  (error) => {
    // 错误响应：处理 Token 失效
    if (error.response) {
      const status = error.response.status;
      // 401：Token 过期/未登录；403：Token 无效/权限不足
      if (status === 401 || status === 403) {
        // 清除无效 Token
        localStorage.removeItem('token');
        // 提示用户并跳转到登录页（避免重复跳转）
        if ((router.currentRoute as any).path !== '/login') {
          ElMessage.error('登录状态失效，请重新登录');
          router.push('/login'); // Vue Router 示例，React 替换为自己的路由跳转
        }
      } else {
        // 其他错误提示
        ElMessage.error(error.response.data.message || '请求失败');
      }
    }
    return Promise.reject(error);
  }
);

// 导出封装后的 Axios 实例
export default service;