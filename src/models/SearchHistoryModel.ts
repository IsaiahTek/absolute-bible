import { BaseModel } from "./BaseModel";

export class SearchHistoryModel extends BaseModel{
    constructor(){
        super()
        this.table = 'search_histories'

        // Drop Table
        // this.dropTable()

        // Create Search History Table
        this.createTable("id");
    }
    
    public fetch = async (offset=0, amount=30)=>{
        const queryObject = await this.prepareFetch(offset, amount);
        return queryObject.results as searchHistory[];
    }
    
    public add = async (search:addSearchHistory)=>{
        (await this.store).add({searchText: search.searchText, language: search.language, versionAbbrev: search.versionAbbrev, bookName: search.bookName, timestamp: search.timestamp});
    }

    public update = async (search: searchHistory)=>{
        return (await this.store).put({id: search.id, searchText: search.searchText, language: search.language, versionAbbrev: search.versionAbbrev, bookName: search.bookName, timestamp: search.timestamp});
    }
    
}