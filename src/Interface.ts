interface version{
    name:string,
    abbreviation:string
}
type tabParamsProp = {
    tabID:string,
    bibleAddress:{book_ID:number, chapter_ID:number, verse_ID?:number},
    books:book[],
    language:language,
    version:version
    languageVersions:versions
}
type versions = version[]
interface versionsProps{
    collection:versions,
    selected?:version,
    handleSelect: Function
}
interface languageVersion{
    language: string; versions: versions
}
type languageVersions = languageVersion[]
type language = string
interface languageVersionsProps{
    collection:languageVersions,
    selected?:version,
    handleSelect: Function
}
interface languageProps{
    collection:languageVersions,
    selected?:language,
    handleSelect: Function
}
type verse = string
type verses = verse[]
type chapters = verses[]
type bookName = "Genesis"|"Exodus"|"Leviticus"
interface book{
    abbrev: string,
    name: bookName,
    chapters:chapters
}
interface booksProps{
    collection: book[],
    selected?:number,
    handleSelect?: Function
}
interface chaptersProps{
    collection: chapters,
    selected?:number,
    handleSelect?:Function
}
type adapterVersions = {abbreviation:"asv"|"bible_esv"|"yoruba-bible"|"kjv", name:string}
type verseAddress = {book_ID:number, chapter_ID:number, verse_ID:number}
type tab = {
    tabID: string;
    book_ID: number;
    chapter_ID: number;
    verse_ID?: number;
    bookName?:string,
    language: string;
    versionAbbrev: string;
}
type addTabHistory = {tab:tab, date:string}
interface tabHistory extends addTabHistory { id:number }
type tabHistoryCollection = tabHistory[]
type addSearchHistory = {searchPhrase:string, language:language, version:version, bookName:book["name"]|"all", date:string}
interface searchHistory extends addSearchHistory {id:number}
type searchHistoryCollection = searchHistory[]
type addOpenedTab = tab
interface tabModel extends addOpenedTab{
    id:number 
}
type openedTab = tabModel
interface computedOpenedTab extends openedTab{books:Promise<book[]>}
interface resolvedOpenedTab extends openedTab{books:book[]}
type searchResult = {address:{bookName:string, chapter_ID:number, verse_ID:number}, text:string, rank:number}
type searchPayload = {bible:book[], version?:version}