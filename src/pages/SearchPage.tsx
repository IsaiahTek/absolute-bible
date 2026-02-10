import { SearchRounded } from "@mui/icons-material"
import { Avatar, Box, Button, Card, CardHeader, Chip, Divider, IconButton, InputAdornment, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from "@mui/material"
import { Grid } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { LoadingNotifier, bibleDefinition, deepSearch, isEfficientSearchText } from "./components"
import { fetchAndCommitBibleFile } from "../adapters"
// import { useNavigate } from "react-router-dom"
import { SearchHistoryModel } from "../models/SearchHistoryModel"

export const SearchPage = () => {
    const SearchHistory = useMemo(() => new SearchHistoryModel(), [])
    const [searchHistories, setSearchHistories] = useState<SearchHistory[]>([])
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [searchText, setSearchText] = useState("")
    const [selectedLanguage,] = useState(bibleDefinition[0].language)
    const [selectedVersion,] = useState(bibleDefinition[0].versions[0])
    const [selectedBookName,] = useState<Book["name"] | "all">("all")
    const [bible, setBible] = useState<Book[]>([])
    const searchPayLoad: SearchPayload = { bible: bible, version: selectedVersion }

    const [isSearching, setIsSearching] = useState(false)
    useEffect(() => {
        fetchAndCommitBibleFile(selectedVersion, setBible);
        SearchHistory.fetch().then(result => { setSearchHistories(result); console.log(result) })
    }, [SearchHistory, selectedVersion])
    const seePreviousSearchResult = (historyText: string) => {
        setSearchResults([])
        setSearchText(historyText)
        deepSearch(historyText, searchPayLoad).then(r => setSearchResults(r))
    }
    const handleGetSearchResults = () => {
        setIsSearching(true)
        setSearchResults([])
        if (searchText) {
            deepSearch(searchText, searchPayLoad).then(r => {
                setSearchResults(r);
                const sH: AddSearchHistory = { ...newSearchHistory, resultLength: r.length, timestamp: String(Date.now()) }
                if (isEfficientSearchText(searchText)) {
                    console.log(r.length)
                    SearchHistory.add(sH).then(
                        // res => {
                        // if(res.rowsAffected===1){
                        //     setSearchHistories([...searchHistories, {...sH, id:res.lastInsertId}])
                        // }
                    // }
                )
                }
                setTimeout(() => {
                    setIsSearching(false)
                }, 500)
            })
        }
    }
    const newSearchHistory: AddSearchHistory = { searchText: searchText, resultLength: searchResults.length, language: selectedLanguage, versionAbbrev: selectedVersion.abbreviation, bookName: selectedBookName ? selectedBookName : "all", timestamp: "" }
    // useEffect(()=>{
    // }, [searchResults])

    // const navigate = useNavigate()
    return (
        <Box>
            {/* <Box sx={{backgroundColor:"white", display:"flex", paddingLeft:2, alignItems:"center", overflowX:"auto", marginBottom:1}}>
                <AppMenu />
                <Box sx={{backgroundColor:"white", paddingY:.8, position:"fixed", zIndex:5, top:0, left:60, width:"90vw"}}>
                    <Button size="small" onClick={()=>navigate('/')} ><Backspace fontSize="small" sx={{marginRight:1}} /> Back</Button>
                </Box>
            </Box> */}
            <Grid container spacing={2}>
                {/* Left Panel */}
                <Grid size={{ xs: 12, sm: 3 }}>
                    <Box sx={{ px: 2, pt: 4, minHeight: "91vh", maxHeight: "91vh" }}>
                        <Card sx={{ mt: 2, pl: 2 }}>
                            <CardHeader
                                avatar={<Avatar><SearchRounded /></Avatar>}
                                title="Search Histories"
                            />
                        </Card>
                        <List>
                            {searchHistories.map(history => (
                                <ListItem key={history.id}>
                                    <ListItemButton onClick={() => seePreviousSearchResult(history.searchText)}>
                                        <ListItemText primary={history.searchText} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Grid>

                {/* Divider */}
                <Grid size="auto">
                    <Divider flexItem orientation="vertical" />
                </Grid>

                {/* Right Panel */}
                <Grid size={{ xs: 12, sm: 8 }}>
                    <Box sx={{ position: "sticky", top: 40, zIndex: 5, bgcolor: "white", pt: 2 }}>
                        <TextField
                            fullWidth
                            placeholder="Enter search word or phrase"
                            value={searchText}
                            onChange={ev => setSearchText(ev.target.value)}
                            onKeyUp={ev => ev.key.toUpperCase() === "ENTER" && isEfficientSearchText(searchText) && handleGetSearchResults()}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            disabled={!isEfficientSearchText(searchText)}
                                            onClick={handleGetSearchResults}
                                        >
                                            <SearchRounded />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Box textAlign="right">
                            {searchResults.length > 0 && (
                                <Typography variant="caption" sx={{ backgroundColor: "#EFEFEF", p: 1 }}>
                                    Found {searchResults.length} result{searchResults.length > 1 ? "s" : ""}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {isSearching ? (
                        <LoadingNotifier sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", height: "70vh" }} />
                    ) : (
                        <Box sx={{ mt: 5 }}>
                            {searchResults.map(result => (
                                <Box key={`${result.address.bookName}-${result.address.chapter_ID}-${result.address.verse_ID}`} sx={{ my: 2 }}>
                                    <span>{`${result.address.bookName} ${result.address.chapter_ID + 1}:${result.address.verse_ID + 1}`}</span>
                                    <Typography dangerouslySetInnerHTML={{ __html: result.text }} />
                                    <Typography variant="caption"><Chip size="small" label={result.rank} /></Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Button size="small">Add to opened Bible Tabs</Button>
                                    </Box>
                                    <Divider sx={{ mt: 1 }} />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Grid>
            </Grid>

        </Box>
    )
}