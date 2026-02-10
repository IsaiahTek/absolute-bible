export interface Chapter {
  verses: string[];
}

export interface Book {
  name: string;
  abbrev: string;
  chapters: Chapter[];
}

/**
 * Custom sort and structure the ASV Bible JSON
 * @param BIBLE_ASV - Raw ASV JSON fetched from file
 * @returns Array of Book objects
 */
function customSort(BIBLE_ASV: Record<string, Record<string, Record<string, string>>>): Book[] {
  const bookNameList = Object.keys(BIBLE_ASV);

  const Bible: Book[] = bookNameList.map(name => {
    const book = BIBLE_ASV[name];
    const chapters = Object.keys(book);

    return {
      name,
      abbrev: name,
      chapters: chapters.map(chapterKey => {
        const verseObj = book[chapterKey];
        return {
          verses: Object.values(verseObj)
        };
      })
    };
  });

  return Bible;
}

/**
 * Convert raw ASV JSON to standardized Bible JSON structure
 * @param bibleJSON_File - Raw ASV JSON object
 * @returns Array of Book objects
 */
function bibleAsvToStandard(
  bibleJSON_File: Record<string, Record<string, Record<string, string>>>
): Book[] {
  return customSort(bibleJSON_File);
}

// Exporting the conversion function
const EN_ASV = bibleAsvToStandard;
export default EN_ASV;
