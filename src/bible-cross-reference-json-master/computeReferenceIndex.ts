import computedMap from "./computed_reference.map.json"
export const formatedBookNames = (books:book[])=>{
  let bookNames = books?.map(book=>book.name.replaceAll(" ", "").substring(0,3).toUpperCase())
  return bookNames = bookNames?.map(book=>{
    book = book.toUpperCase().includes("JUDG")?"JDG":book
    book = book.toUpperCase().includes("JUDE")?"JDE":book
    book = book.toUpperCase().includes("PHI")?"PHP":book
    book = book.toUpperCase().includes("SONG")?"SOS":book
    return book
  })
}
export const getReferencePointer = (bookName:string, chapterVal:number, verseVal:number, books:book[])=>{
    let bookNames = formatedBookNames(books)
    bookName = bookName.toUpperCase()==="JUD"?"JDG":bookName.toUpperCase()
    
    const bookAt = (bookName:string|number)=>bookNames?.indexOf(bookName.toString())
    const withinRange = (low:number, high:number, val:number) =>low<=val && val<=high    
    
    // Different books example: Gen & Exo
    const differentBooks = (f_bk:string|number, s_bk:string|number, f_ch:number|string, s_ch:number|string, f_v:any, s_v:number|string)=>{
      if((bookName===f_bk && bookName !== s_bk) || (bookName !== f_bk && bookName===s_bk)){
        if(bookName===f_bk && chapterVal >= Number(f_ch)){
          if(chapterVal === Number(f_ch)){
            return verseVal >= Number(f_v)
          }else return true
        }else if(bookName===s_bk && chapterVal <= Number(s_ch)){
          if(chapterVal === Number(s_ch)){
            return verseVal <= Number(s_v)
          }else return true
        }
      }else{
        return distancedBook(f_bk, s_bk, f_ch, s_ch, s_v) 
      }
    }
    
    // Same book example: Gen x & Gen y where x < y
    const sameBookAndDifferentChapter = (f_bk:string|number, s_bk:string|number, f_ch:number|string, s_ch:number|string, s_v:number|string)=>{
      if(f_bk.toString() === bookName && bookName === s_bk.toString() && withinRange(Number(f_ch), Number(s_ch), chapterVal)){
        if(chapterVal === Number(s_ch) && verseVal>Number(s_v)){
          return false
        }else{
          return true
        }
      }else return false
    }

    // distanced book example: Ruth between Judges & 1Samuel
    const distancedBook = (f_bk:string|number, s_bk:string|number, f_ch:number|string, s_ch:number|string, s_v:number|string)=>withinRange(bookAt(f_bk), bookAt(s_bk), bookAt(bookName))
    
    return computedMap.findIndex((ref, id)=>
    (differentBooks(ref.first_ref[0], ref.last_ref[0], ref.first_ref[1], ref.last_ref[1], ref.first_ref[2], ref.last_ref[2])) || (sameBookAndDifferentChapter(ref.first_ref[0], ref.last_ref[0], ref.first_ref[1], ref.last_ref[1], ref.last_ref[2])))
  }