import Database, { QueryResult } from "tauri-plugin-sql-api";

export const db = Database.load("sqlite:absolute_bible.db")

export abstract class BaseModel{
    table!:string
    constructor(){}
    public _dbObject = async()=> await db.then(dbx=>dbx)

    get databaseObject(){
        return this._dbObject()
    }

    public createTable = async(schema:string[])=>await (await this.databaseObject).execute(`CREATE TABLE IF NOT EXISTS ${this.table} (${schema.join(", ")})`)

    abstract fetch(offset:number, amount:number):Promise<tabHistory[]|searchHistory[]|tabModel[]>
    abstract add<Type extends tabHistory>(type:Type):Promise<QueryResult>
    abstract add<Type extends searchHistory>(type:Type):Promise<QueryResult>
    abstract add<Type extends openedTab>(type:Type):Promise<QueryResult>
    abstract update<Type extends tabHistory>(type:Type):Promise<QueryResult>
    abstract update<Type extends searchHistory>(type:Type):Promise<QueryResult>
    abstract update<Type extends openedTab>(type:Type):Promise<QueryResult>

    public delete = async(id:number)=>await (await this.databaseObject).execute(`DELETE FROM ${this.table} WHERE id = ${id}`)
    public dropTable = async()=>await (await this.databaseObject).execute(`DROP TABLE ${this.table}`)
}