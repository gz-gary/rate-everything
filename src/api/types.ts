// 共享类型 —— Worker 和前端唯一的数据类型定义源
// worker.ts 和 client.ts 都从这里 import

export interface Rating {
  id: number;
  item: string;
  category: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export type CreateRatingInput = Pick<Rating, 'item' | 'rating'> &
  Partial<Pick<Rating, 'category' | 'comment'>>;

export type UpdateRatingInput = Partial<Pick<Rating, 'rating' | 'comment'>>;
