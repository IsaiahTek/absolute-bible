
import { Box, Button, Typography } from "@mui/material";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { TabHistory } from "../models/TabHistoryModel";
import { OpenedTab } from "../models/OpenedTabModel";
import { Backspace } from "@mui/icons-material";
import { AppMenu } from "./components";
import Grid2 from "@mui/material/Unstable_Grid2";

export const HistoriesPage = ()=>{
    useEffect(()=>{
        const historyObj = new TabHistory()
        const openedTab = new OpenedTab()
        openedTab.fetch().then(v=>console.log(v))
        historyObj.fetch().then(v=>console.log("Tab history: ", v));
    }, [])
    return(
        <Box>
            <Box sx={{backgroundColor:"white", display:"flex", paddingLeft:2, alignItems:"center", overflowX:"auto", marginBottom:1}}>
                <AppMenu />
                <Box sx={{backgroundColor:"white", paddingY:.8, position:"fixed", zIndex:5, top:0, left:60, width:"90vw"}}>
                    <Button size="small" onClick={()=>window.history.back()}><Backspace fontSize="small" sx={{marginRight:1}} /> Back</Button>
                </Box>
            </Box>
            <Grid2 container paddingTop={5}>
                <Grid2 sm={4}>
                    <Box paddingX={2}>
                        <Typography>Tabs</Typography>
                    </Box>
                </Grid2>
            </Grid2>
        </Box>
    )
}
