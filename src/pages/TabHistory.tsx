import { QueryResult } from "@tauri-apps/plugin-sql";
// import { BaseModel } from "../models/BaseModel";
import { Box, Typography } from "@mui/material";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export const HistoriesPage = ()=>{
    useEffect(()=>{
        // const historyObj = new TabHistory();
        // const openedTab = new OpenedTab();
        // openedTab.fetch().then(v=>console.log(v))
    }, [])
    return(
        <Box>
            <Typography variant="h3">Histories</Typography>
            <Link to="/">Done</Link>
        </Box>
    )
}

