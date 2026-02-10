// ------------------- Bible Versions -------------------
 interface Version {
  name: string
  abbreviation: string
}

 type Versions = Version[]

 interface VersionsProps {
  collection: Versions
  selected?: Version
  handleSelect: (version: Version) => void
}

// ------------------- Languages -------------------
 interface LanguageVersion {
  language: string
  versions: Versions
}

 type LanguageVersions = LanguageVersion[]
 type Language = string

 interface LanguageVersionsProps {
  collection: LanguageVersions
  selected?: Version
  handleSelect: (version: Version) => void
}

 interface LanguageProps {
  collection: LanguageVersions
  selected?: Language
  handleSelect: (language: Language) => void
}

// ------------------- Bible Structure -------------------
 type Verse = string
 type Verses = Verse[]
 type Chapters = Verses[]

 type BookName = "Genesis" | "Exodus" | "Leviticus"

 interface Book {
  abbrev: string
  name: BookName
  chapters: Chapters
}

 interface BooksProps {
  collection: Book[]
  selected?: number
  handleSelect?: (index: number) => void
}

 interface ChaptersProps {
  collection: Chapters
  selected?: number
  handleSelect?: (index: number) => void
}

// ------------------- Adapters -------------------
 type AdapterVersions = {
  abbreviation: "asv" | "bible_esv" | "yoruba-bible" | "kjv"
  name: string
}

 type VerseAddress = {
  book_ID: number
  chapter_ID: number
  verse_ID: number
}

// ------------------- Tabs -------------------
 type Tab = {
  tabID: string
  book_ID: number
  chapter_ID: number
  verse_ID?: number
  bookName?: string
  language: string
  versionAbbrev: string
}

 type AddTabHistory = { tab: Tab; date: string }

 interface TabHistory extends AddTabHistory {
  id: number
}

 type TabHistoryCollection = TabHistory[]

 type AddSearchHistory = {
  searchText: string
  language: string
  versionAbbrev: string
  bookName: Book["name"] | "all"
  resultLength: number
  timestamp: string
}

 interface SearchHistory extends AddSearchHistory {
  id: number
}

 type SearchHistoryCollection = SearchHistory[]

 type AddOpenedTab = Tab

 interface TabModel extends AddOpenedTab {
  id: number
}

 type OpenedTab = TabModel & { chapter_ID?: number}

 interface ComputedOpenedTab extends OpenedTab {
  books: Promise<Book[]>
}

 interface ResolvedOpenedTab extends OpenedTab {
  books: Book[]
}

 type SearchResult = {
  address: { bookName: string; chapter_ID: number; verse_ID: number }
  text: string
  rank: number
}

 type SearchPayload = {
  bible: Book[]
  version?: Version
}

// ------------------- Tab Params -------------------
 type TabParamsProp = {
  tabID: string
  bibleAddress: { book_ID: number; chapter_ID: number; verse_ID?: number }
  books: Book[]
  language: Language
  version: Version
  languageVersions: Versions
}
