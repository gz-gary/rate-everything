import type { Rating, CreateRatingInput, UpdateRatingInput } from './types';

// ---------- API client ----------

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const ratingsApi = {
  /** 获取所有评分 */
  list: () => request<Rating[]>('/ratings'),

  /** 获取单个评分 */
  get: (id: number) => request<Rating>(`/ratings/${id}`),

  /** 创建评分 */
  create: (data: CreateRatingInput) =>
    request<{ id: number }>('/ratings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 更新评分（rating 和/或 comment） */
  update: (id: number, data: UpdateRatingInput) =>
    request<{ success: boolean }>(`/ratings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** 删除评分 */
  delete: (id: number) =>
    request<{ success: boolean }>(`/ratings/${id}`, {
      method: 'DELETE',
    }),
};
