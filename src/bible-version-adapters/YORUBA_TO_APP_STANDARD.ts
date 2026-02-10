// Bible is NOT IMPORTED but rather fetched to reduce app size and increase speed of initialization
// import BIBLE_YORUBA from "../bible_versions/yoruba-bible.json"
type yoruba_bible = {
    bookName: BookName,
    details:{
        book_number:number,
        chapter:number,
        verse:number,
        text:string
    }[]
}[]

export default function NG_YORUBA(BIBLE_YORUBA:yoruba_bible):Book[]{
    const books:Book[] = []
    let chapters: Chapters = []
    let verses: Verses = []
    BIBLE_YORUBA.forEach(bible => {
        const bookName = bible.bookName
        let chapter = 1
        bible.details.forEach(details => {
            if(details.chapter === chapter){
                verses.push(details.text)
            }else{
                // Add verses of chapter to chapters
                chapters.push(verses.splice(0))
                verses.push(details.text)
            }
            chapter = details.chapter
        });
        // Add the verses of last chapter to chapters
        if(verses){
            chapters.push(verses.splice(0))
        }
        books.push({
            chapters:chapters,
            name:bookName,
            abbrev:bookName
        })
        verses = []
        chapters = []
    });
    return books
}
