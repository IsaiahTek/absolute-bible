import { BaseModel } from "./BaseModel";

export class OpenedTab extends BaseModel {
    constructor() {
        super();
        this.table = "opened_tabs";

        // this.dropTable()
        this.createTable("id");
    }

    // Getter for IDBObjectStore
    private get tabStore(): Promise<IDBObjectStore> {
        return (async () => {
            const db = await this.databaseObject;
            const transaction = db.transaction(this.table, "readwrite");
            return transaction.objectStore(this.table);
        })();
    }

    // Fetch tabs with optional pagination
    public fetch = async (offset = 0, amount = 30): Promise<TabModel[]> => {
        const value = await this.prepareFetch(offset, amount);
        return value.results as TabModel[];
    }

    // Add a new tab
    public add = async (tab: AddOpenedTab): Promise<void> => {
        const store = await this.tabStore;
        await store.add({
            tabID: tab.tabID,
            bookName: tab.bookName,
            language: tab.language,
            versionAbbrev: tab.versionAbbrev,
            book_ID: tab.book_ID,
            chapter_ID: tab.chapter_ID,
            verse_ID: tab.verse_ID
        });
    }

    // Update an existing tab
    public update = async (tab: TabModel): Promise<void> => {
        const store = await this.tabStore;
        await store.put({
            id: tab.id,
            tabID: tab.tabID,
            bookName: tab.bookName,
            language: tab.language,
            versionAbbrev: tab.versionAbbrev,
            book_ID: tab.book_ID,
            chapter_ID: tab.chapter_ID,
            verse_ID: tab.verse_ID
        });
    }

    // Delete a tab by ID
    // public delete = async (id: number): Promise<void> => {
    //     const store = await this.store;
    //     return store.delete(id);
    // }
}
