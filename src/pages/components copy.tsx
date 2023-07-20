import bibleIndex from "../bible_versions/bible-master/json/index.json";
import EN_ASV from "../bible-version-adapters/ASV_TO_APP_STANDARD";
import EN_ESV from "../bible-version-adapters/ESV_TO_APP_STANDARD";
import NG_YORUBA from "../bible-version-adapters/YORUBA_TO_APP_STANDARD";
import {BibleJSON_FROM_XML} from "../bible-version-adapters/XML_TO_STANDARD"
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import referencesCollection from "../bible-cross-reference-json-master/combined_references_to_array.json"
import { formatedBookNames } from '../bible-cross-reference-json-master/computeReferenceIndex'
import { Add, ArrowDropDown, Visibility, VisibilityOff } from '@mui/icons-material'
import { Box, Button, ButtonGroup, Card, Chip, CircularProgress, Dialog, DialogActions, Divider, FormControl, IconButton, InputLabel, List, ListItem, ListItemButton, ListItemText, MenuItem, Select, TextField, Tooltip, TooltipProps, Typography, styled, tooltipClasses } from "@mui/material";

import { FC, useEffect, useState } from "react";
export const VersionGroups:FC<languageVersionsProps> = ({collection, selected, handleSelect})=>{
    return <>{collection.map(({language,versions})=> {
        return(
            <List key={language}>
                <Typography fontStyle="italic" textAlign="right" fontSize={11} paddingRight={1} variant="subtitle2"><span style={{backgroundColor:"#E1E1E1", padding:"2px 8px"}}>{language}</span></Typography>
                <Divider sx={{marginBottom:-1}} />
                <Versions handleSelect={handleSelect} selected={selected} collection={versions}></Versions>
            </List>
        )
    })
}
</>
}

// export const Versions:FC<versionsProps> = ({collection, selected, handleSelect})=>{
//     const theme = useTheme()
//     return <List>{collection.map(option=> <ListItem disablePadding key={option.abbreviation} onClick={()=>{handleSelect(option)}}>
//         {selected?.abbreviation === option.abbreviation?
//         <Box sx={{background:theme.palette.primary.main, color:"white", width:"100%"}}>
//             <ListItemButton >
//                 <ListItemText>{option.name}</ListItemText>
//             </ListItemButton>
//         </Box>
//         :
//         <Box sx={{width:"100%"}}>
//             <ListItemButton >
//                 <ListItemText>{option.name}</ListItemText>
//             </ListItemButton>
//         </Box>
//         }
//     </ListItem>)}</List>
// }
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

export const Search:FC<{bible:book[], version:version}> = ({bible, version})=>{
    const [results, setResults] = useState<{address:{book:string, chapter_id:number, verse_id:number}, text:string}[]>([])
    const [searchKeyphrase, setSearchKeyphrase] = useState("")
    const unsearchedKeys = ["is", "us", "as", "of", "the", "but", "by", "at", "to", "that", "be", "he", "and", "she", "to", "this"]
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
        // let composedKeyRegPattern = ""
        // keyFragments.forEach((searchKeyphrase, id)=>{
        //     if(keyFragments.length > 1){
        //         if(id === 0) {
        //             composedKeyRegPattern += "("+ searchKeyphrase
        //         }else if(id < keyFragments.length-1) {
        //             composedKeyRegPattern +=  ")|("+searchKeyphrase
        //         }else if(id === keyFragments.length-1){
        //             composedKeyRegPattern = composedKeyRegPattern+")"
        //         }
        //     }else{
        //         composedKeyRegPattern += searchKeyphrase
        //     }
        // })
        if(keyFragments.length)
        setKeyRegPattern(keyFragments.reduce((acc, curVal)=>`${acc}(?=.*${curVal})|(?<=${acc}.*)${curVal}`))         //OLD Pattern
        // setKeyRegPattern(keyFragments.reduce((acc, curVal)=>`${acc}.*${curVal}`))         //NEW Pattern
        
    },[keyFragments])
    async function searchBibleAndCommitResult(){
        setResults([])          // Empty the results when no search-text
        setFinishedSearching(false)
        if(searchKeyphrase.length > 4 && !unsearchedKeys.includes(searchKeyphrase)){
            let foundResults:{address:{book:string, chapter_id:number, verse_id:number}, text:string}[] = []
            bible.forEach((book, b_id)=>{
                book.chapters.forEach((chapter, c_id)=>{
                    chapter.forEach((verse, v_id)=>{
                        if(new RegExp(keyRegPattern, "gi").test(verse)){
                            let  newText = verse.replace(new RegExp(keyRegPattern, "gi"), (match)=>{
                                return `<span class="highlight-text"><em>${match}</em></span>`
                            })
                            let newObj = {"address":{book:book.name, chapter_id:c_id, verse_id:v_id}, "text":newText}
                            foundResults.push(newObj)
                        }
                        if(bible.length-1 === b_id && book.chapters.length-1 === c_id && chapter.length-1 === v_id){
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
                    <Typography>Searching for "<span style={{color:"darkgreen"}}>{searchKeyphrase}</span>" in {version.name}</Typography>
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
                            <div style={{marginBottom:"10px"}} dangerouslySetInnerHTML={{__html:`<div>${result.address.book} ${result.address.chapter_id+1}: ${result.address.verse_id+1}: ${result.text}</div>`}} key={id}></div>
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
    
    const adapters = {"asv":EN_ASV, "bible_esv":EN_ESV, "yoruba-bible":NG_YORUBA}
    const adapterNames = Object.keys(adapters)
    const bibleAdapters = Object.values(adapters)
    
    const fetchAndCommitBibleFile = ()=>{
        // this.setState({hasLoadedBible : false})
        if(version){
          let usesAdapter = adapterNames.includes(version.abbreviation)
          let baseUrl = (usesAdapter)?"./bible_versions/":"./bible_versions/bible-master/json/"
          fetch(`${baseUrl+version.abbreviation}.json`).then((response)=>{
            return response.json()
          }).then((data)=>{
            if(usesAdapter){
              let abbreviation = version.abbreviation
              let bible = bibleAdapters[adapterNames.findIndex(name => name === abbreviation)](data)
              setBooks(bible)
            }else{
              setBooks(data)
            }
          }).then(()=>{
              // this.setState({hasLoadedBible : true})
          })
        }
    }
    useEffect(()=>{
        fetchAndCommitBibleFile()
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
export const MultiVersionVerseGroup:FC<{versions:versions, selectedVersion:version, verseAddress:verseAddress}> = ({versions, selectedVersion, verseAddress})=>{
    return(
        <>
            <Typography variant="h6">Other Associated versions</Typography>
            <Box sx={{height:"63vh", boxShadow:"0px 4px 8px silver", backgroundColor:"#FCFCFC", overflowY:"auto", borderRadius:1}}>
            {
                verseAddress.verse_ID >=0?
                versions.map((version)=>version !== selectedVersion ? <VersionVerse version={version} verseAddress={verseAddress} key={version.abbreviation} />:null)
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
export const Tab:FC<{tabID:string, bibleAddress?:{language:language, version:version, verseAddress:verseAddress}, setBibleAddress:Function, requestTabEdit?:string}> = ()=>{
    const [books, setBooks] = useState<book[]>([])
    const [selectedLanguage, setSelectedLanguage] = useState("English")
    const [selectedVersion, setSelectedVersion] = useState(bibleIndex[0].versions[0])
    const languageVersions = bibleIndex.filter((obj)=>obj.language === selectedLanguage)[0].versions
    const [chapter_ID, setChapter_ID] = useState(0)
    const [referenceVerse, setReferenceVerse] = useState<string[]>([])
  
    // Book here refers to the name of any book of the bible such as Genesis, Exodus, ... Revelation
    const [book_ID, setBook_ID] = useState(-1)
    
    // Verse ID for MultiVerse View
    const [verse_ID, setVerse_ID] = useState(-1)
  
    function handleSetBook_ID(book_ID:number){
      setBook_ID(book_ID)
    }
  
    const handleSetChapter_ID = (ev:Event, id:number)=>{
      ev.stopPropagation()
      setChapter_ID(id)
    //   handleMouseLeave()
    }
  
    // const handleExpandChapterContainer = ()=>{
    //   expandChaptersContainer?handleMouseLeave():handleMouseEnter()
    // }
    // const handleMouseEnter = ()=>{
    //   mouseOnChapterContainer.current = true
    //   setTimeout(()=>{
    //     if(mouseOnChapterContainer.current) setExpandChaptersContainer(true)
    //   }, 100)
    // }
  
    // const handleMouseLeave = ()=>{
    //   mouseOnChapterContainer.current = false;
    //   setExpandChaptersContainer(false)
    // }
  
    useEffect(()=>{
      if(languageVersions?.length){
        setSelectedVersion(languageVersions[0])
      }
    }, [selectedLanguage, languageVersions])
  
    
    const book = books[book_ID]
    const chapters = book?book.chapters:null
    const verses = chapters?chapters[chapter_ID]:null 
  
    const chapterNumber = chapter_ID>=0?chapter_ID+1:null
    
    const adapters = {"asv":EN_ASV, "bible_esv":EN_ESV, "yoruba-bible":NG_YORUBA, "bible_amp":BibleJSON_FROM_XML, "Bible_English_GNB":BibleJSON_FROM_XML}
    const adapterNames = Object.keys(adapters)
    const bibleAdapters = Object.values(adapters)
  
    // const [, setExpandBooksContainer] = useState(false)
    // let mouseOnChapterContainer = useRef(false)
    // const chapterContainerElement = useRef<any>(null)
    // const [expandChaptersContainer, setExpandChaptersContainer] = useState(false)
    
    const referencesForVerse = ()=>{
      let refAddr = [...referenceVerse]
      refAddr[0] = refAddr[0].toUpperCase().includes("JUDG")?"JDG":refAddr[0]
      refAddr[0] = refAddr[0].toUpperCase().includes("JUDE")?"JDE":refAddr[0]
      refAddr[0] = refAddr[0].toUpperCase().includes("PHI")?"PHP":refAddr[0]
      refAddr[0] = refAddr[0].toUpperCase().includes("SONG")?"SOS":refAddr[0]
      refAddr[0] = refAddr[0].replaceAll(" ", "").substring(0,3).toUpperCase()
      
      return referencesCollection.find((ref: { verse: any[] })=>ref.verse.join(" ") === refAddr.join(" "))?.references
    }
  
    const getVerseFromRef = (verseRef:string[])=>{
      let bookNames = formatedBookNames(books)
      let bookId = bookNames.indexOf(verseRef[0])
      if(bookId === -1) return null
      return books[bookId].chapters[Number(verseRef[1])-1][Number(verseRef[2])-1]
    }
    // useEffect(()=>{
    //   const el = document.getElementsByClassName("MuiChip-filledPrimary")[0]
    //   el?.scrollIntoView({block:"center", behavior:"smooth"})
    // }, [expandChaptersContainer])
  
    useEffect(()=>{
      fetchAndCommitBibleFile()
    }, [selectedVersion])
  
    useEffect(()=>{
      if(typeof book !== "undefined" && (book.chapters.length === 1 || chapter_ID >= book.chapters.length)){
        setChapter_ID(0)
      }
    }, [book, chapter_ID])
    // Fetch Books (Bible) of the selected version and assign to state
    const fetchAndCommitBibleFile = ()=>{
      // this.setState({hasLoadedBible : false})
      if(selectedVersion){
        let bibleNameIndex = adapterNames.indexOf(selectedVersion.abbreviation)
        let usesAdapter = adapterNames.includes(selectedVersion.abbreviation)
        let isXmlBible = usesAdapter && bibleAdapters[bibleNameIndex] === BibleJSON_FROM_XML
        let baseUrl = (usesAdapter)?"./bible_versions/":"./bible_versions/bible-master/json/"
        fetch(`${baseUrl+selectedVersion.abbreviation}${isXmlBible?".xml":".json"}`).then((response)=>{
          return isXmlBible?response.text():response.json()
        }).then((data)=>{
          if(usesAdapter){
            let abbreviation = selectedVersion.abbreviation
            let bible = bibleAdapters[adapterNames.findIndex(name => name === abbreviation)](data)
            setBooks(bible)
          }else{
            setBooks(data)
          }
        }).then(()=>{
            // this.setState({hasLoadedBible : true})
        })
      }
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
            <Grid sm={2.5} xs={12} sx={{paddingBottom:2}}>
              <Books selected={book_ID} collection={books} handleSelect={handleSetBook_ID} />
            </Grid>
            <Grid sm={9.3} mdOffset={0.2} sx={{alignContent:"flex-start"}}>
              <Box>
                <Card sx={{height:"100%", padding:1, paddingBottom:1, marginX:1, marginBottom:1, display:"flex", justifyContent:"space-between"}}>
                  <Grid container width="100%" alignItems="end">
                    <Grid xs={12} sx={{display:"flex", justifyContent:"space-between"}} md={6}>
                      <Languages collection={bibleIndex} handleSelect={setSelectedLanguage} selected={selectedLanguage} />
                      <Box width="50%">
                        <Search bible={books} version={selectedVersion}/>
                      </Box>
                    </Grid>
                    {languageVersions?
                    <Grid xs={12} md={5} mdOffset={1} >
                      <Typography marginRight={1}>Versions</Typography>
                      <Versions collection={languageVersions} selected={selectedVersion} handleSelect={setSelectedVersion} />
                    </Grid>
                    :
                    null}
                  </Grid>
              {/* <VersionGroups handleSelect={setSelectedVersion} selected={selectedVersion} collection={bibleIndex} /> */}
                </Card>
              </Box>
              {(chapters) ?
              <>
                <Box marginTop={1} sx={{zIndex:2, position:"relative", marginTop:2}}>
                  <Box sx={{display:"flex", justifyContent:"space-between", marginBottom:-1, paddingX:2}}>
                    <Typography color='primary'>Chapters of {book.name}</Typography>
                  </Box>
                </Box>
                <Box sx={{position:"relative", zIndex:0, marginTop:1}}>
                  {verses?<Grid container marginRight={2}>
                    <Grid md={6.7}>
                      <Box sx={{margin:1}}>
                        <Box sx={{fontStyle:"italic", display:"inline-flex", padding:1.3, color:"white", borderRadius:"5px 5px 0px 0px", backgroundColor:"primary.main", marginRight:1}}>{book.name} {chapterNumber?chapterNumber+": "+1+" - "+verses?.length:null}
                        </Box>
                        <IconButton size='small' sx={{border:"1px solid", borderColor:"primary.main"}} color='primary'><Add fontSize='small' /></IconButton>
                        <Card variant='outlined' sx={{maxHeight:"63vh", width:"100%", borderTopLeftRadius:"0px", overflowY:"auto"}}>
                          {verses.map((verse, id)=>
                          <Box sx={{padding:2, backgroundColor:hoveredVerse===id?"#ebf8d8":verse_ID === id?"primary.light":"inherit"}} key={id} onMouseEnter={()=>handleMouseEnterVerse(id)} onMouseLeave={()=>handleMouseLeaveVerse()} onClick={()=>setVerse_ID(id)} >
                            <Typography sx={{textAlign:"justify"}} variant='body1'>
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
                      <Box sx={{padding:1, width:"100%"}}>
                        {/* Multiversion Verse Display Here */}
                        <MultiVersionVerseGroup versions={languageVersions} selectedVersion={selectedVersion} verseAddress={{book_ID:book_ID, chapter_ID:chapter_ID, verse_ID:verse_ID}} />
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