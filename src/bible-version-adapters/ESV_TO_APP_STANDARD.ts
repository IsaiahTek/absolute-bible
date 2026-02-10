export interface Chapter {
  verses: string[];
}

export interface Book {
  name: string;
  abbrev: string;
  chapters: Chapter[];
}

// Type for raw ESV JSON structure
export interface ESVVerse {
  __text: string;
}

export interface ESVChapter {
  VERS: ESVVerse[];
}

export interface ESVBook {
  _bname: string;
  CHAPTER: ESVChapter[];
}

export interface ESVBible {
  XMLBIBLE: {
    BIBLEBOOK: ESVBook[];
  };
}

/**
 * Convert raw ESV JSON to standardized Bible JSON structure
 * @param BIBLE_ESV - Raw ESV JSON object
 * @returns Array of Book objects
 */
function bibleEsvToStandard(BIBLE_ESV: ESVBible): Book[] {
  const Bible: Book[] = BIBLE_ESV.XMLBIBLE.BIBLEBOOK.map(book => ({
    name: book._bname,
    abbrev: book._bname,
    chapters: book.CHAPTER.map(chapter => ({
      verses: chapter.VERS.map(verseObj => verseObj.__text)
    }))
  }));

  return Bible;
}

// Export the conversion function
const EN_ESV = bibleEsvToStandard;
export default EN_ESV;
