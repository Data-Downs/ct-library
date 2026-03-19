import libraryData from './library.json'
import themesData from './themes.json'
import heroData from './hero.json'
import type { Book, ThemeDescription, HeroSelection } from '../types'

export const books: Book[] = libraryData as unknown as Book[]
export const themeDescriptions: ThemeDescription[] = themesData as unknown as ThemeDescription[]
export const heroSelection: HeroSelection = heroData as unknown as HeroSelection
