export type Profile = {
  user_id: string
  username: string
  avatar_url: string | null
  bio: string | null
  tiktok: string | null
  instagram: string | null
}

export type Larp = {
  id: string
  name: string
  claim: string
  upvotes: number
  downvotes: number
  score?: number        // generated column — may not exist in all environments
  created_at: string
  user_id?: string | null
  profiles?: Pick<Profile, 'username' | 'avatar_url' | 'bio' | 'tiktok' | 'instagram'> | null
}
