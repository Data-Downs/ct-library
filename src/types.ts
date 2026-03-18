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
}

export type Theme =
  | 'Cookbooks & Food'
  | 'Literature & Fiction'
  | 'Art & Architecture'
  | 'Philosophy & Ideas'
  | 'Memoir & Life Writing'
  | 'Travel & Places'
  | 'History & Politics'
  | 'Nature & Environment'
  | 'Poetry'
  | 'Design & Photography'

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
