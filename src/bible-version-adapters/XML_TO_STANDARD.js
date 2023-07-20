export const BibleJSON_FROM_XML = (bible)=>{
    const xmlDocument = new DOMParser().parseFromString(bible, "text/xml")
    const booksElement = Array.from(xmlDocument.getElementsByTagName("BIBLEBOOK"))
    return booksElement.map(book=>{
        const name = book.getAttribute("bname")
        let chapters = Array.from(book.getElementsByTagName("CHAPTER"))
        return {
            name:name,
            abbrev:name,
            chapters:chapters.map(chapter=>{
                let verses = Array.from(chapter.getElementsByTagName("VERS"))
                return verses.map(verse=>verse.textContent)
            })
        }
    })
    
}