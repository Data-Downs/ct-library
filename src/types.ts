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
  themes: Theme[]
  themeNotes: Partial<Record<Theme, string>>
  isCookbook?: boolean
}

export type Theme =
  | 'The Politics of Otherness'
  | 'Seeing and Power'
  | 'What Lies Beneath'
  | 'Ruins and Resilience'
  | 'The Body as Battleground'
  | 'Place and Belonging'

export interface ThemeDescription {
  name: Theme
  tagline: string
  description: string
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