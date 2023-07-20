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
        historyObj.fetch().then(v=>console.log(v))
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
        this.createTable(["id INTEGER PRIMARY KEY", "tab TEXT UNIQUE"])
    }
    public fetch = async(offset=0, amount=30)=>{
        return await (await this.databaseObject).select<openedTab[]>(`SELECT * FROM ${this.table} LIMIT ${offset}, ${amount}`)
    }
    public add = async(tab:tab)=>{
        return await (await this.databaseObject).execute(`INSERT INTO ${this.table} (tab) VALUES('${JSON.stringify(tab)}')`)
    }
    public update = async(model: openedTab) => {
        return await (await this.databaseObject).execute(`UPDATE ${this.table} SET(tab) VALUES('${JSON.stringify(model.tab)}') WHERE id = ${model.id}`)
    }
}