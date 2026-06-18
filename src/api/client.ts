import { createClient } from '@supabase/supabase-js'
import type { Rating, CreateRatingInput, UpdateRatingInput } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. ' +
    'Copy .env.example to .env and fill in your Supabase project credentials.'
  )
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const ratingsApi = {
  /** 获取所有评分 */
  list: async (): Promise<Rating[]> => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data
  },

  /** 获取单个评分 */
  get: async (id: number): Promise<Rating> => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  /** 创建评分 */
  create: async (data: CreateRatingInput) => {
    const { data: result, error } = await supabase
      .from('ratings')
      .insert(data)
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    return { id: result.id }
  },

  /** 更新评分（rating 和/或 comment） */
  update: async (id: number, data: UpdateRatingInput) => {
    const { error } = await supabase
      .from('ratings')
      .update(data)
      .eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
  },

  /** 删除评分 */
  delete: async (id: number) => {
    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
  },
}
