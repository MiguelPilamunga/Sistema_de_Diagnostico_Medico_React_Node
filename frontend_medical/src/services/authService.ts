import request from './api';
import { LoginResponse, User } from '../interfaces/auth';

interface Credentials {
  username: string;
  password: string;
}

interface ProfileResponse {
  user: User;
}

export const login = async (credentials: Credentials): Promise<LoginResponse> => {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const refreshToken = async (refreshToken: string): Promise<LoginResponse> => {
  return request<LoginResponse>('/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
};

export const getProfile = async (token: string): Promise<ProfileResponse> => {
  return request<ProfileResponse>('/auth/profile', {
    token,
  });
};

export const logout = async (token: string): Promise<void> => {
  await request('/auth/logout', {
    method: 'POST',
    token,
  });
};
