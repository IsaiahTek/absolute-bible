import { BaseModel } from "./BaseModel";

export class TabHistory extends BaseModel{
    constructor(){
        super();
        this.table = "tab_histories";
        this.createTable(["id number Primary Key", "tab TEXT UNIQUE", "date TEXT"])
    }
    public fetch = async(offset=0, amount=30)=>{
        return await (await this.databaseObject).select<tabHistory[]>(`SELECT * FROM ${this.table} LIMIT ${offset}, ${amount}`)
    }
    public add = async(tabHistory:addTabHistory)=>{
        return await (await this.databaseObject).execute(`INSERT INTO ${this.table} (tab, date) VALUES ('${JSON.stringify(tabHistory.tab)}', '${tabHistory.date}')`)
    }
    public update = async(tabHistory: tabHistory) => {
        return await (await this.databaseObject).execute(`UPDATE ${this.table} SET(tab) VALUES('${JSON.stringify(tabHistory.tab)}') WHERE id = ${tabHistory.id}`)
    }
    
}
