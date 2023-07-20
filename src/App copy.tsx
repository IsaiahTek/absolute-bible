// import { invoke } from '@tauri-apps/api/tauri'
import bibleIndex from "./bible_versions/bible-master/json/index.json"
import { Books, Chapters, HtmlTooltip, Languages, MultiVersionVerseGroup, Search} from './pages/components'
import { FC, useEffect, useRef, useState } from 'react'
import { Box, Button, ButtonGroup, Card, IconButton, ThemeProvider, Typography, createTheme, useMediaQuery } from '@mui/material'
import EN_ASV from "./bible-version-adapters/ASV_TO_APP_STANDARD"
import EN_ESV from "./bible-version-adapters/ESV_TO_APP_STANDARD"
import NG_YORUBA from "./bible-version-adapters/YORUBA_TO_APP_STANDARD"
import {BibleJSON_FROM_XML} from "./bible-version-adapters/XML_TO_STANDARD"
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import referencesCollection from "./bible-cross-reference-json-master/combined_references_to_array.json"
import { formatedBookNames } from './bible-cross-reference-json-master/computeReferenceIndex'
import { Add, Visibility, VisibilityOff } from '@mui/icons-material'


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { InstallPWA, LogInstallationSuccessEvent } from './pages/InstallApp'
import React from 'react'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvhKDOMYEflVnPpwmqLBFW8OvGhDmKw8I",
  authDomain: "absolute-bible.firebaseapp.com",
  projectId: "absolute-bible",
  storageBucket: "absolute-bible.appspot.com",
  messagingSenderId: "127365858543",
  appId: "1:127365858543:web:81bbfbf019fecc1e9c071a",
  measurementId: "G-QJFGX9BG5T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

LogInstallationSuccessEvent(()=>logEvent(analytics, "pwa_installed", {"pwa_installed":true}))

export const Versions:FC<versionsProps> = ({collection, selected, handleSelect})=>{
  const getLastStringPart = (str:string)=>{
    let arr = str.split("_")
    return arr[arr.length-1]
  }
  return(<ButtonGroup>{collection.map(version =><Button variant={version.name===selected?.name?"contained":"outlined"} key={version.name} onClick={()=>handleSelect(version)}>{getLastStringPart(version.abbreviation)}</Button>)}</ButtonGroup>)
}
export default function Home() {
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
    handleMouseLeave()
  }

  const handleExpandChapterContainer = ()=>{
    expandChaptersContainer?handleMouseLeave():handleMouseEnter()
  }
  const handleMouseEnter = ()=>{
    mouseOnChapterContainer.current = true
    setTimeout(()=>{
      if(mouseOnChapterContainer.current) setExpandChaptersContainer(true)
    }, 100)
  }

  const handleMouseLeave = ()=>{
    mouseOnChapterContainer.current = false;
    setExpandChaptersContainer(false)
  }

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

  const [, setExpandBooksContainer] = useState(false)
  let mouseOnChapterContainer = useRef(false)
  const chapterContainerElement = useRef<any>(null)
  const [expandChaptersContainer, setExpandChaptersContainer] = useState(false)
  
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
  useEffect(()=>{
    const el = document.getElementsByClassName("MuiChip-filledPrimary")[0]
    el?.scrollIntoView({block:"center", behavior:"smooth"})
  }, [expandChaptersContainer])

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

  const theme = React.useMemo(()=>{
    return createTheme({
      palette:{
        primary:{
          main:"#304e00",
          dark:"#1c2e00",
          light:"#cfeca2"
        },
        secondary:{
          main:"#00d5d1",
          dark:"#00aba7",
          light:"#bbaba7"
        }
      }
    })
  }
  , [])
  const [hoveredVerse, setHoveredVerse] = useState(-1)
  const handleMouseEnterVerse = (verse_ID:number)=>{
    setHoveredVerse(verse_ID)
  }
  const handleMouseLeaveVerse = ()=>{
    setHoveredVerse(-1)
  }
  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Grid container>
          <Grid sm={2.5} xs={12} sx={{paddingBottom:2}}>
            <Books selected={book_ID} collection={books} handleSelect={handleSetBook_ID} />
            <InstallPWA />
          </Grid>
          <Grid sm={9.3} mdOffset={0.2} sx={{alignContent:"flex-start"}}>
            <Box>
              <Card sx={{height:"100%", padding:1, paddingBottom:1, marginX:1, marginBottom:1, display:"flex", justifyContent:"space-between"}} onMouseEnter={()=>setExpandBooksContainer(true)} onMouseLeave={()=>setExpandBooksContainer(false)}>
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
              <Box marginTop={1} sx={{zIndex:2, position:"relative", marginTop:2}} onClick={()=>handleExpandChapterContainer()}>
                <Box sx={{display:"flex", justifyContent:"space-between", marginBottom:-1, paddingX:2}}>
                  <Typography color='primary'>Chapters of {book.name}</Typography>
                  <Typography color='primary'>{expandChaptersContainer?"Collapse Chapters":"Expand Chapters"}</Typography>
                </Box>
                <Card ref={chapterContainerElement} sx={{height:expandChaptersContainer?"100%":"40px", overflowY:"auto", padding:1, paddingBottom:0, margin:1}} onMouseEnter={()=>handleMouseEnter()} onMouseLeave={()=>handleMouseLeave()}>
                  <Chapters collection={chapters} selected={chapter_ID} handleSelect={handleSetChapter_ID} />
                </Card>
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
    </ThemeProvider>
  )
}
