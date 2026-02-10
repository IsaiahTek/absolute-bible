export interface Verse {
  text: string;
}

export interface Chapter {
  verses: string[];
}

export interface Book {
  name: string | null;
  abbrev: string | null;
  chapters: Chapter[];
}

/**
 * Converts a Bible XML string into a structured JSON object
 * @param bible - The Bible XML string
 * @returns Array of Book objects with chapters and verses
 */
export const BibleJSON_FROM_XML = (bible: string): Book[] => {
  const xmlDocument = new DOMParser().parseFromString(bible, "text/xml");
  const booksElement = Array.from(xmlDocument.getElementsByTagName("BIBLEBOOK"));

  return booksElement.map(book => {
    const name = book.getAttribute("bname");

    const chapters = Array.from(book.getElementsByTagName("CHAPTER")).map(chapter => {
      const verses = Array.from(chapter.getElementsByTagName("VERS")).map(
        verse => verse.textContent ?? ""
      );
      return { verses };
    });

    return {
      name,
      abbrev: name,
      chapters
    };
  });
};
