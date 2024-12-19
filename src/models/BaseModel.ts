// import Database, { QueryResult } from "@tauri-apps/plugin-sql";

const db = indexedDB.open("absolute_bible.db")

type DBResultObject = {results:any[]}
type IDBDatabaseRef = {value: IDBDatabase|null}

export abstract class BaseModel {
    table!: string

    public _dbObject = db;

    get databaseObject(): Promise<IDBDatabase> {
        const dbRef: IDBDatabaseRef = { value: null };
        return new Promise((resolve, reject)=>{
            try {
                (this._dbObject).onsuccess = (event) => {
                    dbRef.value = ((event.target as IDBRequest).result as IDBDatabase);
                    resolve(dbRef.value);
                };
                (this._dbObject).onerror = (err)=>{
                    console.log("ERROR GETTING DB", err);
                    reject(err)
                }
                if(this._dbObject.readyState ==='done'){
                    resolve(this._dbObject.result);
                }
            } catch (error) {
                // console.log("ERROR GETTING DB TryCatch", error);
                reject(error)
            }
        })
    }

    get store():Promise<IDBObjectStore>{
        return new Promise(async(resolve,)=>{
            const transaction = (await this.databaseObject).transaction(this.table, 'readwrite');
            const store = transaction.objectStore(this.table);
            resolve(store);
        });
    }

    // public createTable = async(schema:string[])=>await (await this.databaseObject).execute(`CREATE TABLE IF NOT EXISTS ${this.table} (${schema.join(", ")})`)
    public createTable = async (keyPath: string) => {
        if(!(await this.databaseObject).objectStoreNames.contains(this.table)){
            (await this.databaseObject).close();
            const newVersion = (await this.databaseObject).version + 1;
            const request = indexedDB.open("absolute_bible.db", newVersion);
            request.onupgradeneeded = async (event) => {
                console.log("CREATING (", this.table, ") TABLE");
                const db = (event.target as IDBRequest).result;
                db.createObjectStore(this.table, {autoIncrement: true, keyPath: keyPath });
                // resolve(true);
            }
            // await new Promise((resolve, reject)=>{
            //     try {
            //         console.log("CREATING (", this.table, request, ") TABLE");
            //     } catch (error) {
            //         reject(error);
            //     }
            // })
        }
    }

    public async prepareFetch(offset: number, amount: number):Promise<DBResultObject>{
        const queryObject:DBResultObject = {results:[]};
        try {
            const transaction = (await this.databaseObject).transaction(this.table, 'readonly');
            const store = transaction.objectStore(this.table);
            const range = IDBKeyRange.bound(offset, offset + amount); // retrieve x records starting from v
            const request = store.openCursor(range); // retrieve at most x records
            let count = 0;
            // console.log();
            return new Promise((resolve, reject)=>{
                request.onsuccess = (event) => {
                    // queryObject.results = [];
                    const cursor = (event.target as IDBRequest).result;
                    if (cursor && count < amount) {
                        queryObject.results.push(cursor.value)
                        count++;
                        cursor.continue();
                    }
                    if(!cursor){
                        resolve(queryObject);
                    }
                };
                request.onerror = (err)=>{
                    console.warn("ERROR FETCHING DATA", err);
                    reject(err);
                }
                console.log("Preparing Fetch");
            });
            // while (request.readyState !== 'done') {
            // }
        } catch (error) {
            console.warn("ERROR FETCHING DATA TryCatch", error);
        }
        return queryObject;
    }

    abstract fetch(offset: number, amount: number): Promise<tabHistory[] | searchHistory[] | tabModel[]>
    abstract add<Type extends tabHistory>(type: Type): void;    //:Promise<QueryResult>
    abstract add<Type extends searchHistory>(type: Type): void;   //:Promise<QueryResult>
    abstract add<Type extends openedTab>(type: Type): void;   //:Promise<QueryResult>
    abstract update<Type extends tabHistory>(type: Type): void;   //:Promise<QueryResult>
    abstract update<Type extends searchHistory>(type: Type): void;   //:Promise<QueryResult>
    abstract update<Type extends openedTab>(type: Type): void;   //:Promise<QueryResult>

    // public delete = async(id:number)=>await (await this.databaseObject).execute(`DELETE FROM ${this.table} WHERE id = ${id}`)
    // public dropTable = async()=>await (await this.databaseObject).execute(`DROP TABLE ${this.table}`)

    public delete = async (id: number) => { }
    public dropTable = async (id: number) => { }
}