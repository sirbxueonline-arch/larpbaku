export type Larp = {
  id: string
  name: string
  claim: string
  upvotes: number
  downvotes: number
  score?: number        // generated column — may not exist in all environments
  created_at: string
}
