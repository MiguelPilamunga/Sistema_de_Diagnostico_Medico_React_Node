const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

interface RequestConfig extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, { token, ...config }: RequestConfig = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...config,
    headers: {
      ...headers,
      ...config.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }

  return response.json();
}

export default request;
