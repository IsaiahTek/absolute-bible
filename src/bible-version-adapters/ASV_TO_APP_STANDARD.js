// Bible is NOT IMPORTED but rather fetched to reduce app size and increase speed of initialization
// import BIBLE_ASV from "../bible_versions/asv.json"

function customSort(BIBLE_ASV){
    
    let bookNameList = Object.keys(BIBLE_ASV);

    let Bible = bookNameList.map((name)=>{
        let book = BIBLE_ASV[name];
        let chapters = Object.keys(book);
        return {
            "chapters":chapters.map((v)=> Object.values(book[v]) ),
            "name" : name,
            "abbrev": name
        }
    });
    return Bible;
}
    
function bibleAsvToStandard(bibleJSON_File){
    let finalBook = customSort(bibleJSON_File)
    return finalBook
}
const EN_ASV = bibleAsvToStandard
export default EN_ASV