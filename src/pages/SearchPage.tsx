import { Backspace, Search, SearchRounded } from "@mui/icons-material"
import { Avatar, Box, Button, Card, CardHeader, Chip, Divider, IconButton, InputAdornment, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { useEffect, useState } from "react"
import { AppMenu, LoadingNotifier, bibleDefinition, deepSearch, isEfficientSearchText } from "./components"
import { fetchAndCommitBibleFile } from "../adapters"
import { useNavigate } from "react-router-dom"
import { SearchHistoryModel } from "./SearchHistoryModel"

export const SearchPage = ()=>{
    const searchHistory = new SearchHistoryModel()
    const [searchHistories, setSearchHistories] = useState<searchHistory[]>([])
    const [searchResults, setSearchResults] = useState<searchResult[]>([])
    const [searchText, setSearchText] = useState("")
    const [selectedLanguage, setSelectedLanguage] = useState(bibleDefinition[0].language)
    const [selectedVersion, setSelectedVersion] = useState(bibleDefinition[0].versions[0])
    const [selectedBookName, setSelectedBookName] = useState<book["name"]|"all">("all")
    const [bible, setBible] = useState<book[]>([])
    const searchPayLoad:searchPayload = {bible:bible, version:selectedVersion}

    const [isSearching, setIsSearching] = useState(false)
    useEffect(()=>{
        fetchAndCommitBibleFile(selectedVersion, setBible)
        searchHistory.fetch().then(result=>{setSearchHistories(result); console.log(result)})
    }, [])
    const seePreviousSearchResult = (historyText:string)=>{
        setSearchResults([])
        setSearchText(historyText)
        deepSearch(historyText, searchPayLoad).then(r=>setSearchResults(r))
    }
    const handleGetSearchResults = ()=>{
        setIsSearching(true)
        setSearchResults([])
        if(searchText){
            deepSearch(searchText, searchPayLoad).then(r=>{
                setSearchResults(r);
                let sH:addSearchHistory = {...newSearchHistory, resultLength:r.length, timestamp:String(Date.now())}
                if(isEfficientSearchText(searchText)){
                    console.log(r.length)
                    searchHistory.add(sH).then(res=>{
                        if(res.rowsAffected===1){
                            setSearchHistories([...searchHistories, {...sH, id:res.lastInsertId}])
                        }
                    })
                }
                setTimeout(()=>{
                    setIsSearching(false)
                }, 500)
            })
        }
    }
    const newSearchHistory:addSearchHistory = {searchText: searchText, resultLength: searchResults.length, language: selectedLanguage, versionAbbrev: selectedVersion.abbreviation, bookName: selectedBookName?selectedBookName:"all", timestamp: ""}
    useEffect(()=>{
    }, [searchResults])
    
    const navigate = useNavigate()
    return(
        <Box>
            <Box sx={{backgroundColor:"white", display:"flex", paddingLeft:2, alignItems:"center", overflowX:"auto", marginBottom:1}}>
                <AppMenu />
                <Box sx={{backgroundColor:"white", paddingY:.8, position:"fixed", zIndex:5, top:0, left:60, width:"90vw"}}>
                    <Button size="small"><Backspace fontSize="small" sx={{marginRight:1}} /> Back</Button>
                </Box>
            </Box>
            <Grid2 container>
                <Grid2 sm={3}>
                    <Box sx={{paddingX:2, minHeight:"91vh", maxHeight:"91vh", paddingTop:4}}>
                        <Card sx={{marginTop:2, paddingLeft:2}}>
                            <CardHeader avatar={<Avatar><SearchRounded /></Avatar>} title="Search Histories"></CardHeader>
                        </Card>
                        <List>
                        {searchHistories.map(history=>
                            <ListItem key={history.id}>
                                <ListItemButton onClick={()=>seePreviousSearchResult(history.searchText)}>
                                    <ListItemText primary={history.searchText}></ListItemText>
                                </ListItemButton>
                            </ListItem>
                        )}
                        </List>
                    </Box>
                </Grid2>
                <Divider flexItem orientation="vertical" />
                <Grid2 sm={6} smOffset={.2}>
                    <Box sx={{position:"sticky", top:40, zIndex:5, backgroundColor:"white", paddingTop:2}}>
                        <TextField fullWidth onChange={(ev)=>setSearchText(ev.target.value)} value={searchText} onKeyUpCapture={(ev)=>ev.key.toUpperCase()==="ENTER" && isEfficientSearchText(searchText)?handleGetSearchResults():null} placeholder="Enter search word or phrase" type="numeric" InputProps={{
                            endAdornment:(<InputAdornment position="start"><IconButton disabled={isEfficientSearchText(searchText)?false:true} onClick={()=>handleGetSearchResults()} sx={{marginRight:-2}}><SearchRounded /></IconButton></InputAdornment>)
                        }} />
                        <Box textAlign="right">{searchResults.length?<Typography variant="caption" padding={1} sx={{backgroundColor:"#EFEFEF"}}>Found {searchResults.length} result{searchResults.length>1?"s":null}</Typography>:null}</Box>
                    </Box>
                    {isSearching?
                    <LoadingNotifier sx={{display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column", height:"70vh"}} />
                    :
                    <Box sx={{marginTop:5}}>
                        {searchResults.map(result=>
                            <Box key={result.address.bookName+" "+result.address.chapter_ID+" : "+result.address.verse_ID}>
                                <Box sx={{marginY:2}}>
                                    <span>{result.address.bookName+" "+(result.address.chapter_ID+1)+" : "+(result.address.verse_ID+1)}</span>
                                    <Typography dangerouslySetInnerHTML={{__html:result.text}}></Typography>
                                    <Typography variant="caption"><Chip size="small" label={result.rank} /></Typography>
                                    <Box sx={{marginTop:1}}>
                                        <Button size="small">Add to opened Bible Tabs</Button>
                                    </Box>
                                </Box>
                                <Divider />
                            </Box>
                        )}
                    </Box>
                    }
                </Grid2>
            </Grid2>
        </Box>
    )
}