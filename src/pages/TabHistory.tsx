import { QueryResult } from "tauri-plugin-sql-api";
import { BaseModel } from "./BaseModel";
import { Box, Typography } from "@mui/material";
import { useEffect } from "react";
import { Link } from "react-router-dom";

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
export const HistoriesPage = ()=>{
    useEffect(()=>{
        const historyObj = new TabHistory()
        const openedTab = new OpenedTab()
        openedTab.fetch().then(v=>console.log(v))
    }, [])
    return(
        <Box>
            <Typography variant="h3">Histories</Typography>
            <Link to="/">Done</Link>
        </Box>
    )
}
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