import { BaseModel } from "./BaseModel";

export class OpenedTab extends BaseModel{
    constructor(){
        super();
        this.table = "opened_tabs";
        
        // this.dropTable()
        this.createTable(["id INTEGER PRIMARY KEY", "tabID TEXT UNIQUE", "bookName TEXT", "language TEXT", "versionAbbrev TEXT", "book_ID INTEGER", "chapter_ID INTEGER", "verse_ID INTEGER"])
    }
    public fetch = async(offset=0, amount=30)=>{
        return await (await this.databaseObject).select<openedTab[]>(`SELECT * FROM ${this.table} LIMIT ${offset}, ${amount}`)
    }
    public add = async(tab:tab)=>{
        return await (await this.databaseObject).execute(`INSERT INTO ${this.table} (tabID, bookName, language, versionAbbrev, book_ID, chapter_ID, verse_ID) VALUES("${tab.tabID}", "${tab.bookName}", "${tab.language}", "${tab.versionAbbrev}", ${tab.book_ID}, ${tab.chapter_ID}, ${tab.verse_ID?tab.verse_ID:-1})`)
    }
    public update = async(tab: openedTab) => {
        return await (await this.databaseObject).execute(`
            UPDATE ${this.table}
            SET bookName = "${tab.bookName}", language = "${tab.language}", versionAbbrev = "${tab.versionAbbrev}", book_ID = ${tab.book_ID}, chapter_ID = ${tab.chapter_ID}, verse_ID = ${tab.verse_ID?tab.verse_ID:-1} WHERE id = ${tab.id}
        `)
    }
}