import Grid from '@mui/material/Unstable_Grid2/Grid2'
import combinedReferences from "../bible-cross-reference-json-master/combined_references_to_array.json"
import { formatedBookNames } from '../bible-cross-reference-json-master/computeReferenceIndex'
import { ArrowDropDown, HourglassBottomRounded, MenuSharp, Note, SearchRounded, Settings, Visibility, VisibilityOff, History, Home, Help, Info, Support } from '@mui/icons-material'
import { Avatar, Box, Button, ButtonGroup, Card, Chip, CircularProgress, Dialog, DialogActions, Divider, FormControl, IconButton, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, SvgIconTypeMap, SwipeableDrawer, TextField, Tooltip, TooltipProps, Typography, styled, tooltipClasses } from "@mui/material";
import bibleIndex from "../bible_versions/bible-master/json/index.json"
import { FC, useEffect, useState } from "react";
import { fetchAndCommitBibleFile } from "../adapters";
import { useLocation, useNavigate } from 'react-router-dom';
import { OverridableComponent } from '@mui/material/OverridableComponent';
export const bibleDefinition = bibleIndex
export const Versions:FC<versionsProps> = ({collection, selected, handleSelect})=>{
    const getLastStringPart = (str:string)=>{
      let arr = str.split("_")
      return arr[arr.length-1]
    }
    return(<ButtonGroup>{collection.map(version =><Button variant={version.name===selected?.name?"contained":"outlined"} key={version.name} onClick={()=>handleSelect(version)}>{getLastStringPart(version.abbreviation)}</Button>)}</ButtonGroup>)
}
export const Languages:FC<languageProps> = ({collection, selected, handleSelect})=>{
    // const handleChange = 
    return(<FormControl size="small" sx={{width:"140px"}}>
        <InputLabel>Language</InputLabel>
        <Select size="small" label="Language" onChange={(ev)=>handleSelect(ev.target.value)} value={selected}>{collection.map(({language}, id)=>
            <MenuItem key={language} value={language}>{language}</MenuItem>
        )}</Select>
        </FormControl>
    )
}
export const Books:FC<booksProps> = ({collection, selected, handleSelect})=>{
    const [openBooks, setOpenBooks] = useState(true)
    const openBooksOnMobile = ((typeof selected != "undefined" && selected < 0) || openBooks)?true:false

    return(
        <>
            <Box sx={{padding:1, backgroundColor:"primary.main", color:"white"}}>
              <Typography>Books <span className="hide-on-desktop"><IconButton onClick={()=>setOpenBooks(!openBooks)} size="small" color="success"><ArrowDropDown sx={{color:"white"}} /></IconButton></span></Typography>
            </Box>
            <div className={!openBooksOnMobile?"hide-on-mobile":""}>
                <Box sx={{paddingLeft:.6, paddingTop:1, paddingBottom:2, maxHeight:"85vh", overflowY:"auto"}}>
                    {collection.map((book, id)=><Button sx={{margin:"2px"}} variant={selected===id?"contained":"outlined"} color={selected === id?"primary":undefined} key={book.abbrev} onClick={()=>{setOpenBooks(false);if(handleSelect)handleSelect(id)}} size="small">{book.name}</Button>)}
                </Box>
            </div>
        </>
    )
}

export const Chapters:FC<chaptersProps> = ({collection, selected, handleSelect})=>{
    return(
        <>{collection.map((chapter, id)=><Chip key={id} color={selected===id?"primary":undefined} onClick={(ev)=>{
            if(handleSelect)handleSelect(ev, id)
        }} label={chapter.length?id+1:null} sx={{marginBottom:1, marginRight:1}}></Chip>)}
        </>
    )
}

const unsearchedKeys = ["is", "us", "as", "of", "the", "but", "by", "at", "to", "that", "be", "he", "and", "she", "to", "this"]
export const isEfficientSearchText = (searchText:string)=>searchText.length > 2 && !unsearchedKeys.includes(searchText)

export const SearchInputWithResultDialog:FC<{bible:book[], version?:version}> = ({bible, version})=>{
    const [results, setResults] = useState<{address:{book:string, chapter_ID:number, verse_ID:number}, text:string}[]>([])
    const [searchKeyphrase, setSearchKeyphrase] = useState("")
    const [keyFragments, setKeyFragments] = useState<string[]>([])
    const [keyRegPattern, setKeyRegPattern] = useState("")
    const [finishedSearching, setFinishedSearching] = useState(false)
    const handleSetKeyPhrase = (val:string)=>{
        // Replace all double spaces and more with just single space
        setSearchKeyphrase(val.replace(/\s{2,}/gi, " "))
    }
    useEffect(()=>{
        setKeyFragments(searchKeyphrase.split(" "))
    },[searchKeyphrase])
    useEffect(()=>{
        if(keyFragments.length)
        setKeyRegPattern(keyFragments.reduce((acc, curVal)=>`${acc}(?=.*${curVal})|(?<=${acc}.*)${curVal}`))
    },[keyFragments])
    async function searchBibleAndCommitResult(){
        setResults([])          // Empty the results when no search-text
        setFinishedSearching(false)
        if(isEfficientSearchText(searchKeyphrase)){
            let foundResults:{address:{book:string, chapter_ID:number, verse_ID:number}, text:string}[] = []
            bible.forEach((book, b_ID)=>{
                book.chapters.forEach((chapter, c_ID)=>{
                    chapter.forEach((verse, v_ID)=>{
                        if(new RegExp(keyRegPattern, "gi").test(verse)){
                            let  newText = verse.replace(new RegExp(keyRegPattern, "gi"), (match)=>{
                                return `<span class="highlight-text"><em>${match}</em></span>`
                            })
                            let newObj = {"address":{book:book.name, chapter_ID:c_ID, verse_ID:v_ID}, "text":newText}
                            foundResults.push(newObj)
                        }
                        if(bible.length-1 === b_ID && book.chapters.length-1 === c_ID && chapter.length-1 === v_ID){
                            setResults([...foundResults])
                            setFinishedSearching(true)
                        }
                    })
                })
            })
        }
    }
    const handleShowResult = ()=>{
        setOpenDialog(true)
        setFinishedSearching(false)
        setResults([])
        setTimeout(()=>searchBibleAndCommitResult(), 500)
    }
    const [openDialog, setOpenDialog] = useState(false)
    return(<Box width="100%">
    <TextField size="small" value={searchKeyphrase} placeholder="called Abraham" label="Search" onChange={(ev)=>handleSetKeyPhrase(ev.target.value)} onKeyUp={(ev)=>{if(ev.key.toUpperCase()==="ENTER" && searchKeyphrase.length>4)handleShowResult()}} type="search"/>
    <Dialog open={openDialog}>
        <Box padding={2}>
            {!finishedSearching?<>
                <Box padding={1} sx={{marginBottom:2}}>
                    <Typography>Searching for "<span style={{color:"darkgreen"}}>{searchKeyphrase}</span>" in {version?.name}</Typography>
                </Box>
                <Box sx={{textAlign:"center"}}>
                    <CircularProgress />
                </Box>
                </>:
                results.length?
                    <>
                        <Box padding={1} sx={{borderBottom:"solid 1px green"}}>
                            <Typography>Found "<span style={{color:"darkgreen"}}>{searchKeyphrase}</span>" in {results.length} verse{results.length>1?"s":null}</Typography>
                        </Box>
                        <Box sx={{maxHeight:"67vh", paddingTop:1, overflowY:"auto", backgroundColor:"#FEFEFE", tabIndex:2}}>
                        {results.map((result, id)=>
                            <div style={{marginBottom:"10px"}} dangerouslySetInnerHTML={{__html:`<div>${result.address.book} ${result.address.chapter_ID+1}: ${result.address.verse_ID+1}: ${result.text}</div>`}} key={id}></div>
                        )}
                        </Box>
                    </>
                    :<>
                    {/* <CircularProgress /> */}
                    <Typography variant="body1">No result found for "<span style={{color:"darkgreen"}}>{searchKeyphrase}</span>"</Typography>
                    </>
            }
        </Box>
        <DialogActions><Button onClick={()=>setOpenDialog(false)}>Close</Button></DialogActions>
    </Dialog>
    </Box>)
}

export const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#E2E2E2',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 320,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));
const VersionVerse:FC<{version:version, verseAddress:verseAddress}> = ({version, verseAddress})=>{
    const {book_ID, chapter_ID, verse_ID} = verseAddress
    const [books, setBooks] = useState<book[]>([])
    const book = books[book_ID]
    const chapters = book?book.chapters:null
    const verse = chapters?chapters[chapter_ID][verse_ID]:null 
    
    useEffect(()=>{
        fetchAndCommitBibleFile(version, setBooks)
    },[version])
    return(
        <>
            <Typography variant="h6" sx={{backgroundColor:"primary.light", color:"primary.dark", marginBottom:-1.5, paddingLeft:2}}>{version.name}</Typography>
            <Box sx={{padding:2, textAlign:"justify"}}>
                <Typography>{verse}</Typography>
            </Box>
        </>
    )
}
export const MultiVersionVerseGroup:FC<{selectedVersion:version, verseAddress:verseAddress}> = ({selectedVersion, verseAddress})=>{
  const versions = bibleIndex.find(da=>da.versions.includes(selectedVersion))?.versions
  return(
        <>
            <Box sx={{height:"85vh", boxShadow:"0px 4px 8px silver", backgroundColor:"#FCFCFC", overflowY:"auto", borderRadius:1}}>
            {
                verseAddress.verse_ID >=0?
                versions?.map((version)=>version !== selectedVersion ? <VersionVerse version={version} verseAddress={verseAddress} key={version.abbreviation} />:null)
                :
                <Box sx={{display:"flex", height:"100%", flexDirection:"column", justifyContent:"center", alignItems:"center",}}>
                    <Box>
                        <Typography variant="h6" color="gray" sx={{textAlign:"center"}}>No verse selected</Typography>
                        <Typography color="gray" sx={{fontStyle:"italic"}}>Click on a verse to see other versions in the verse</Typography>
                    </Box>
                </Box>
            }
            </Box>
        </>
    )
}
export const Tab:FC<resolvedOpenedTab> = ({tabID, book_ID, chapter_ID, language, versionAbbrev, bookName, books})=>{
  // const [books, setBooks] = useState<book[]>([])
  // useEffect(()=>fetchAndCommitBibleFile(getVersionUsingLanguageAndAbbreviation(language, versionAbbrev), setBooks), [tabID])
  const chapterNumber = chapter_ID + 1
  const book = books[book_ID]
  const chapters = book?.chapters
  const verses = chapters?chapters[chapter_ID]:[[]]
  // Verse ID for MultiVerse View
  const [verse_ID, setVerse_ID] = useState(-1)
  
  const [referenceVerse, setReferenceVerse] = useState<string[]>([])
  
  const referencesForVerse = ()=>{
    let refAddr = [...referenceVerse]
    refAddr[0] = refAddr[0].toUpperCase().includes("JUDG")?"JDG":refAddr[0]
    refAddr[0] = refAddr[0].toUpperCase().includes("JUDE")?"JDE":refAddr[0]
    refAddr[0] = refAddr[0].toUpperCase().includes("PHI")?"PHP":refAddr[0]
    refAddr[0] = refAddr[0].toUpperCase().includes("SONG")?"SOS":refAddr[0]
    refAddr[0] = refAddr[0].replaceAll(" ", "").substring(0,3).toUpperCase()
    
    return combinedReferences.find((ref: { verse: any[] })=>ref.verse.join(" ") === refAddr.join(" "))?.references
  }

  const getVerseFromRef = (verseRef:string[])=>{
    let bookNames = formatedBookNames(books)
    let bookId = bookNames.indexOf(verseRef[0])
    if(bookId === -1) return null
    return books[bookId].chapters[Number(verseRef[1])-1][Number(verseRef[2])-1]
  }

  const [hoveredVerse, setHoveredVerse] = useState(-1)
  const handleMouseEnterVerse = (verse_ID:number)=>{
    setHoveredVerse(verse_ID)
  }

  const handleMouseLeaveVerse = ()=>{
    setHoveredVerse(-1)
  }
  return (
      <Box>
        <Grid container>
          <Grid sm={12} sx={{alignContent:"flex-start"}}>
            
            {(chapters) ?
            <>
              <Box sx={{position:"relative", zIndex:0, marginTop:1}}>
                {verses?<Grid container marginRight={2} marginLeft={2}>
                  <Grid md={6.7}>
                    <Box>
                      <Card variant='outlined' sx={{maxHeight:"85vh", width:"100%", overflowY:"auto"}}>
                        {verses.map((verse, id)=>
                        <Box sx={{padding:2, backgroundColor:hoveredVerse===id?"#ebf8d8":verse_ID === id?"primary.light":"inherit"}} key={id} onMouseEnter={()=>handleMouseEnterVerse(id)} onMouseLeave={()=>handleMouseLeaveVerse()} onClick={()=>setVerse_ID(id)} >
                          <Typography sx={{textAlign:"justify", fontSize:18}} variant='body1'>
                            <span style={{display:"inline-flex", fontSize:15, color:"gray", marginRight:"10px"}}>{id+1}</span>
                            {verse}
                          </Typography>
                          <Box>
                            <Box sx={{textAlign:"center"}}>
                              {referenceVerse[2] ===(id+1).toString() && referenceVerse[1]===(chapter_ID+1).toString() && referenceVerse[0] === book.name
                              ?
                              <Button size='small' onClick={()=>{setReferenceVerse([])}} color="secondary">
                                <Box sx={{display:"flex", alignItems:"center"}}>
                                  <VisibilityOff />
                                  <Box sx={{marginTop:.8}}>
                                    Hide References
                                  </Box>
                                </Box>
                              </Button>
                              :
                              <Button size='small' color="primary" onClick={()=>{setReferenceVerse([book.name, (chapter_ID+1).toString(), (id+1).toString()])}}>
                                <Box sx={{display:"flex", alignItems:"center"}}>
                                  <Visibility />
                                  <Box sx={{marginLeft:.8}}>
                                    See References
                                  </Box>
                                </Box>
                              </Button>
                              }
                            </Box>
                            {referenceVerse[2] ===(id+1).toString() && referenceVerse[1]===(chapter_ID+1).toString() && referenceVerse[0] === book.name
                            ?
                            referencesForVerse()?.map((ref: any[],id: React.Key | null | undefined)=>
                            <Box display="inline-flex" key={id}>
                              <HtmlTooltip arrow sx={{fontSize:"35px"}} placement='bottom'
                                title={<Card sx={{padding:2}}><Typography>{getVerseFromRef([...ref])}</Typography></Card>}>
                                  <Button size='small' sx={{paddingTop:.6}} variant='text'>{ref.join(" ")}</Button>
                              </HtmlTooltip>
                            </Box>)
                            :
                            null
                            }
                          </Box>
                        </Box>
                        )}
                      </Card>
                    </Box>
                  </Grid>
                  <Grid xs={12} md={5} mdOffset={.3}>
                    <Box sx={{width:"100%"}}>
                      <MultiVersionVerseGroup selectedVersion={getVersionUsingLanguageAndAbbreviation(language, versionAbbrev)} verseAddress={{book_ID:book_ID, chapter_ID:chapter_ID, verse_ID:verse_ID}} />
                    </Box>
                  </Grid>
                </Grid>
                :
                  <Box sx={{display:"flex", height:"75vh", width:"100%", justifyContent:"center", alignItems:"center"}}>
                    <Typography variant='h4' color="gray">Select a chapter</Typography>
                  </Box>
                }
              </Box>
            </>
              :
            <Box sx={{display:"flex", height:"85vh", justifyContent:"center", alignItems:"center"}}>
              <Typography variant='h4' color="gray">Select a book first</Typography>
            </Box>
            }
          </Grid>
        </Grid>
      </Box>
  )
}
export const getVersionUsingLanguageAndAbbreviation = (language:string, abbrev:string):version=>{
  const versions = bibleIndex.find(a=>a.language===language)?.versions
  const version = versions?.find(v=>v.abbreviation===abbrev)
  return version?version:{name:"", abbreviation:""}
}

export const getNormalizedText = (val:string)=>{
  // Replace all double spaces and more with just single space
  return val.replace(/\s{2,}/gi, " ")
}

export const getSearchResult = (query:string, payload:searchPayload)=>{
  const {bible, version} = payload
  const results:searchResult[] = []
  const searchKeyphrase = getNormalizedText(query)
  const keyFragments = searchKeyphrase.split(" ")
  const keyRegPattern = keyFragments.reduce((acc, curVal, curInd, arr)=>{
    console.log(curInd, arr.length)
    return `${acc}(?=.*${curInd<arr.length-1?curVal+"|.*"+arr[curInd+1]:curVal})`
  })
  console.log(keyRegPattern)
  function searchBibleAndCommitResult(){
    if(isEfficientSearchText(searchKeyphrase)){
      let foundResults:searchResult[] = []
      bible.forEach((book, b_ID)=>{
        book.chapters.forEach((chapter, c_ID)=>{
          chapter.forEach((verse, v_ID)=>{
            if(new RegExp(keyRegPattern, "gi").test(verse)){
              let  newText = verse.replace(new RegExp(keyRegPattern, "gi"), (match)=>{
                return `<span class="highlight-text"><em>${match}</em></span>`
              })
              let newObj = {"address":{bookName:book.name, book_ID:b_ID, chapter_ID:c_ID, verse_ID:v_ID}, "text":newText, rank:0}
              foundResults.push(newObj)
            }
            if(bible.length-1 === b_ID && book.chapters.length-1 === c_ID && chapter.length-1 === v_ID){
              results.push(...foundResults)
            }
          })
        })
      })
    }
  }
  searchBibleAndCommitResult()
  return results
}
export const deepSearch = (query:string, payload:searchPayload)=>{
  const {bible, version} = payload
  let results:searchResult[] = []
  const keyFragments =  getNormalizedText(query.trim()).split(" ")
  return new Promise<searchResult[]>((resolve, reject)=>{
    if(isEfficientSearchText(query)){
      // 
      keyFragments.forEach((fragment, id)=>{
        if(isEfficientSearchText(fragment)){
          if(id === 0){
            let foundResults:searchResult[] = []
            bible.forEach((book, b_ID)=>{
              book.chapters.forEach((chapter, c_ID)=>{
                chapter.forEach((verse, v_ID)=>{
                  if(new RegExp(fragment, "gi").test(verse)){
                    let  newText = verse.replace(new RegExp(fragment, "gi"), (match)=>{
                      return `<span class="highlight-text"><em>${match}</em></span>`
                    })
                    let newObj = {"address":{bookName:book.name, book_ID:b_ID, chapter_ID:c_ID, verse_ID:v_ID}, "text":newText, rank:1}
                    foundResults.push(newObj)
                  }
                  if(bible.length-1 === b_ID && book.chapters.length-1 === c_ID && chapter.length-1 === v_ID){
                    results.push(...foundResults)
                  }
                })
              })
            })
          }else{
            results.forEach((result, r_ID)=>{
              if(new RegExp(fragment, "gi").test(result.text)){
                let  newText = result.text.replace(new RegExp(fragment, "gi"), (match)=>{
                  return `<span class="highlight-text"><em>${match}</em></span>`
                })
                let editedObj = {...result, text:newText, rank:result.rank+1}
                results = results.map(fR=>fR.address === editedObj.address?editedObj:fR)
              }
            })
          }
        }
      })
      resolve(results.sort((a,b)=>b.rank-a.rank))
    }else{
      reject("Invalid search text")
    }
  })
}
type routes = {pathname:string|undefined, name:string|undefined, MenuIcon:OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; }|undefined, type:string}[];


export const AppMenu = ()=>{
  const routes = [
    {pathname:"/", name:"Home", MenuIcon:Home, type:"link"},
    {pathname:"/search", name:"Search", MenuIcon:SearchRounded, type:"link"},
    // {pathname:"/histories", name:"Usage Histories", MenuIcon:History, type:"link"},
    {pathname:"/notes", name:"My Notes", MenuIcon:Note, type:"link"},
    {pathname:"/study-plan", name:"Study Plans", MenuIcon:HourglassBottomRounded, type:"link"},
    {type:"divider"},
    {pathname:"/settings", name:"Settings", MenuIcon:Settings, type:"link"},
    {type:"divider"},
    {pathname:"/help", name:"Help", MenuIcon:Help, type:"link"},
    {pathname:"/about", name:"About", MenuIcon:Info, type:"link"},
    {pathname:"/donate", name:"Support Absolute Bible", MenuIcon:Support, type:"link"},
  ]
  const navigate = useNavigate()
  const location = useLocation()
  const [openMainMenu, setOpenMainMenu] = useState(false)
  return(
    <>
      <Box sx={{marginRight:5}}>
        <Box sx={{position:"fixed", width:50, top:0, left:0, zIndex:10, backgroundColor:"white"}}>
          <IconButton id="main_menu" color="primary" sx={{position:"sticky", top:30, left:2}} onClick={()=>setOpenMainMenu(true)}><MenuSharp /></IconButton>
          <Divider sx={{width:"100vw"}} />
        </Box>
      </Box>
      <SwipeableDrawer anchor="left" open={openMainMenu} onOpen={()=>setOpenMainMenu(true)} onClose={()=>setOpenMainMenu(false)}>
        <Box sx={{height:"100vh", width:300}}>
          <Box sx={{paddingY:5, paddingX:2, display:"flex", alignItems:"center"}}>
            <Box>
              <Avatar sx={{width:48, height:48}} />
            </Box>
            <Box sx={{marginLeft:2}}>
              <Typography variant='body1'>Not Login User</Typography>
              <Typography variant='caption'>Login</Typography>
            </Box>
          </Box>
          <Divider /> 
          <List onClick={()=>setOpenMainMenu(false)} onKeyDown={()=>setOpenMainMenu(false)}>
            {routes.map((r, id)=>{
              const MenuIcon = r.MenuIcon
              if(r.type === "divider"){
                return <Divider key={id} />
              }else if(r.pathname && MenuIcon){
                return(
                  <ListItem key={id} sx={{backgroundColor:r.pathname===location.pathname?"primary.light":"default"}} disablePadding>
                    <ListItemButton onClick={()=>navigate(r.pathname)}>
                      <ListItemIcon><MenuIcon /></ListItemIcon>
                      <ListItemText>{r.name}</ListItemText>
                    </ListItemButton>
                  </ListItem>
                )
              }
            })}
          </List>
          <Box position="absolute" bottom={0} width="100%" sx={{backgroundColor:"primary.light"}}>
            <Box sx={{padding:2}}>
              App Version: 01.01.001
            </Box>
          </Box>
        </Box>
      </SwipeableDrawer>
    </>  
  )
}
export const LoadingNotifier = (prop:any)=>{
  return(
    <Box >
      <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", flexDirection:"column"}} {...prop}>
        <Box>
          <CircularProgress />
        </Box>
        <Typography>Loading...</Typography>
      </Box>
    </Box>
  )
}