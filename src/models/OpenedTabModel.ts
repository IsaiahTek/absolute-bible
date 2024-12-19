import { BaseModel } from "./BaseModel";

export class OpenedTab extends BaseModel{
    constructor(){
        super();
        this.table = "opened_tabs";
        
        // this.dropTable()
        this.createTable("id")
    }
    // static toOpenedTab(obj:Object):tab[]{
    //     return [{
    //         tabID: "",
    //         book_ID: 0,
    //         chapter_ID: 0,
    //         language: "",
    //         versionAbbrev: ""
    //     }]
    // }
    public fetch = async(offset=0, amount=30)=>{
        const value = await this.prepareFetch(offset, amount);
        return value.results as tabModel[];
    }
    public add = async(tab:tab)=>{
        // const transaction = (this.databaseObject).transaction(this.table, 'readwrite');
        // const store = transaction.objectStore(this.table);
        (await this.store).add({tabID:tab.tabID, bookName:tab.bookName, language:tab.language, versionAbbrev: tab.versionAbbrev, book_ID: tab.book_ID, chapter_ID: tab.chapter_ID, verse_ID: tab.verse_ID});
    }
    public update = async(tab: openedTab) => {
        (await this.store).put({id: tab.id, tabID:tab.tabID, bookName:tab.bookName, language:tab.language, versionAbbrev: tab.versionAbbrev, book_ID: tab.book_ID, chapter_ID: tab.chapter_ID, verse_ID: tab.verse_ID})
        // `
        //     UPDATE ${this.table}
        //     SET bookName = "${tab.bookName}", language = "${tab.language}", versionAbbrev = "${tab.versionAbbrev}", book_ID = ${tab.book_ID}, chapter_ID = ${tab.chapter_ID}, verse_ID = ${tab.verse_ID?tab.verse_ID:-1} WHERE id = ${tab.id}
        // `)
    }
}