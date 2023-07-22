import { Backspace, Search, SearchRounded } from "@mui/icons-material"
import { Box, Button, Card, Divider, IconButton, InputAdornment, TextField, Typography } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { useEffect, useState } from "react"
import { AppMenu, SearchInputWithResultDialog, bibleDefinition, deepSearch, getSearchResult } from "./components"
import { fetchAndCommitBibleFile } from "../adapters"
import { useNavigate } from "react-router-dom"

export const SearchPage = ()=>{
    const [searchResults, setSearchResults] = useState<searchResult[]>([])
    const [searchText, setSearchText] = useState("")
    const [selectedLanguage, setSelectedLanguage] = useState(bibleDefinition[0].language)
    const [selectedVersion, setSelectedVersion] = useState(bibleDefinition[0].versions[0])
    const [bible, setBible] = useState<book[]>([])
    const searchPayLoad:searchPayload = {bible:bible, version:selectedVersion}

    useEffect(()=>{
        fetchAndCommitBibleFile(selectedVersion, setBible)
    }, [])
    const handleGetSearchResults = ()=>{
        setSearchResults([])
        if(searchText){
            setSearchResults(deepSearch(searchText, searchPayLoad))
        }
    }
    const navigate = useNavigate()
    return(
        <Box>
            <Box sx={{paddingLeft:2}}><AppMenu /> <Button onClick={()=>navigate("/")}><Backspace fontSize="small" sx={{marginRight:1}} /> Back</Button></Box>
            <Grid2 container>
                <Grid2 sm={3} height="90vh">
                    <Card sx={{marginTop:2, paddingLeft:2}}>
                        <Typography variant="h5">
                            Your search history here
                        </Typography>
                    </Card>
                </Grid2>
                <Divider flexItem orientation="vertical" />
                <Grid2 sm={6} smOffset={.2}>
                    <Box marginTop={2}>
                        <TextField fullWidth onChange={(ev)=>setSearchText(ev.target.value)} value={searchText} placeholder="Enter search word or phrase" type="numeric" InputProps={{
                            endAdornment:(<InputAdornment position="start"><IconButton onClick={()=>handleGetSearchResults()} sx={{marginRight:-2}}><SearchRounded /></IconButton></InputAdornment>)
                        }} />
                    </Box>
                    <Box>
                        {searchResults.map(result=><Box key={result.address.bookName+result.address.chapter_ID+result.address.verse_ID}>
                            <span>{result.address.bookName+" "+result.address.chapter_ID+" "+result.address.verse_ID} RANKED AT {result.rank}</span>
                            <Typography>{result.text}</Typography>
                        </Box>
                        )}
                    </Box>
                </Grid2>
            </Grid2>
        </Box>
    )
}