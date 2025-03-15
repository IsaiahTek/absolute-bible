import { BaseModel } from "./BaseModel";

export class SearchHistoryModel extends BaseModel{
    constructor(){
        super()
        this.table = 'search_histories'

        // Drop Table
        // this.dropTable()

        // Create Search History Table
        this.createTable(["id INTEGER PRIMARY KEY", "searchText TEXT NOT NULL", "language TEXT", "versionAbbrev TEXT", "bookName TEXT DEFAULT 'All'", "resultLength INTEGER", "timestamp TEXT", "UNIQUE(searchText, versionAbbrev, bookName)"])
    }
    
    public fetch = async (offset=0, amount=30)=>{
        return await (await this.databaseObject).select<searchHistory[]>(`SELECT * FROM ${this.table} LIMIT ${offset}, ${amount}`)
    }
    
    public add = async (search:addSearchHistory)=>{
        return await (await this.databaseObject).execute(`INSERT INTO ${this.table} (searchText, language, versionAbbrev, bookName, timestamp) VALUES('${search.searchText}', '${search.language}', '${search.versionAbbrev}', '${search.bookName}', '${search.timestamp}')`)
    }

    public update = async (search: searchHistory)=>{
        return await (await this.databaseObject).execute(`UPDATE ${this.table} SET searchText = '${search.searchText}', language = '${search.language}', versionAbbrev = '${search.versionAbbrev}', bookName = '${search.bookName}', timestamp = '${search.timestamp}' WHERE id = ${search.id}`)
    }
    
}