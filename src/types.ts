export type Genre =
  | 'Fiction'
  | 'Non-fiction'
  | 'Poetry'
  | 'Philosophy'
  | 'Art Catalogue'
  | 'Reference'
  | 'Cookbook'

export type Subject =
  | 'Continental Philosophy'
  | 'Critical Theory'
  | 'Psychoanalysis'
  | 'Art & Visual Culture'
  | 'Literature & Memoir'
  | 'Feminism & Gender'
  | 'Spirituality & Mysticism'
  | 'Education & Pedagogy'
  | 'Nature & Science'
  | 'History & Politics'
  | 'Design & Architecture'
  | 'Recovery & Inner Work'

export type Theme =
  | 'The Politics of Otherness'
  | 'Seeing and Power'
  | 'What Lies Beneath'
  | 'Ruins and Resilience'
  | 'The Body as Battleground'
  | 'Place and Belonging'
  | 'Consciousness and the Sacred'
  | 'The Machine and the Human'

export interface Book {
  id: string
  title: string
  author: string
  description: string
  synopsis: string
  year: number
  pages?: number
  coverColour: string
  amazonUrl: string
  isbn?: string
  coverUrl?: string
  genre: Genre
  subjects: Subject[]
  themes: Theme[]
  themeNotes: Partial<Record<Theme, string>>
}

export interface ThemeRecommendation {
  title: string
  author: string
  reason: string
  amazonUrl: string
}

export interface ThemeDescription {
  name: Theme
  tagline: string
  description: string
  recommendations: ThemeRecommendation[]
}

export interface HeroPick {
  bookId: string
  note: string
}

export interface HeroSelection {
  title: string
  description: string
  picks: HeroPick[]
}

export type ViewMode = 'grid' | 'list'

export type SortMode = 'title' | 'author' | 'year-asc' | 'year-desc'
