import axios from 'axios';

const baseURL =
  process.env.NODE_ENV === 'development'
    ? 'https://keep.ktssolution.co.kr/ecrm/'
    : '/ecrm/';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300; // 200-299 상태 코드만 허용
  },
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
  config.withCredentials = true;
  config.headers['X-Requested-With'] = 'XMLHttpRequest';

  // URL에 .html이 포함된 경우 요청 중단
  if (config.url?.includes('.html')) {
    return Promise.reject(new Error('HTML request blocked'));
  }

  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    const contentType = response.headers['content-type'];
    if (
      contentType &&
      (contentType.includes('text/html') || contentType.includes('text/plain'))
    ) {
      return {
        ...response,
        data: {},
        headers: {
          ...response.headers,
          'content-type': 'application/json',
        },
      };
    }
    return response;
  },
  (error) => {
    if (error.response?.headers['content-type']?.includes('text/html')) {
      return Promise.resolve({ data: {} });
    }
    return Promise.reject(error);
  }
);

export default api;
