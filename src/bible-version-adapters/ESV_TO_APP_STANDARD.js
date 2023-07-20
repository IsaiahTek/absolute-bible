// Bible is NOT IMPORTED but rather fetched to reduce app size and increase speed of initialization
// import BIBLE_ESV from "../bible_versions/bible_esv.json"
function bibleEsvToStandard(BIBLE_ESV){
    let Bible = BIBLE_ESV["XMLBIBLE"]["BIBLEBOOK"].map((book)=>{
        return {
            "chapters":book.CHAPTER.map((VERSES)=>
                VERSES.VERS.map((verseObj)=>
                    verseObj.__text)),
            "name" : book._bname,
            "abbrev":book._bname
        }
    })
    return Bible
}

let EN_ESV = bibleEsvToStandard
export default EN_ESV