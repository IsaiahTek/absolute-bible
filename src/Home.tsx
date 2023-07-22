import bibleIndex from "./bible_versions/bible-master/json/index.json"
import { Chapters, Languages, Tab, getVersionUsingLanguageAndAbbreviation} from './pages/components'
import { FC, Fragment, useEffect, useState } from 'react'
import { Box, Button, Card, CardActions, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, SwipeableDrawer, Typography, createTheme} from '@mui/material'
import { Add, ArrowDropDown, Delete, Edit, History, HourglassBottomRounded, MenuSharp, MoreVert, Note, Remove, SearchRounded, Settings } from '@mui/icons-material'


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { InstallPWA, LogInstallationSuccessEvent } from './pages/InstallApp'
import React from 'react'
import { generateRandomKey } from "./string_helper"
import { fetchAndCommitBibleFile, fetchBible } from "./adapters"
import { useNavigate } from "react-router-dom"
import { OpenedTab } from "./pages/TabHistory"
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
  return(<Box>{collection.map(version =><Button sx={{marginRight:1, marginBottom:1}} variant={version.name===selected?.name?"contained":"outlined"} key={version.name} onClick={()=>handleSelect(version)}>{getLastStringPart(version.abbreviation)}</Button>)}</Box>)
}

export default function Home() {
  
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
  
  const openedTab = new OpenedTab()

  // This is done once (At each launch or refresh of this window)
  const fetchAndCommitOpenedTabs = (offset?:number, amount?:number)=>{
    openedTab.fetch(offset, amount).then(async(result)=>{
      // fetchAndCommitBibleFile()
      let computedTabsWithBooks = []
      for(let i = 0; i < result.length; i++){
        let res = result[i]
        let books = fetchBible(getVersionUsingLanguageAndAbbreviation(res.language, res.versionAbbrev)).then(r=>r)
        computedTabsWithBooks.push({books:(await books), ...res})
      }
      setTabParamsCollection(computedTabsWithBooks)
      setActiveTabID(activeTabID?activeTabID:result[0].tabID)
    })
  }
  useEffect(()=>fetchAndCommitOpenedTabs(), [])
  const [tabParamsCollection, setTabParamsCollection] = useState<resolvedOpenedTab[]>([])
  const [isCreateNewTab, setIsCreateNewTab] = useState(true)
  const handleAddTabToDB = (tab:addOpenedTab)=>{
    // Adding new Tab
    if(tab){
      openedTab.add(tab).then(()=>{
        fetchAndCommitOpenedTabs()
      })
      setActiveTabID(tab.tabID)
      setIsCreateNewTab(false)
    }
    setOpenTabDialog(false)
  }
  const handleEditTab = (tab:openedTab)=>{
    setIsCreateNewTab(false)
    // Editing Existing Tab
    if(tab){
      openedTab.update(tab).then(()=>{
        fetchAndCommitOpenedTabs()
      })
    }
    setOpenTabDialog(false)
  }
  const handleDeleteTab = (tab_id:number, tabID:string)=>{
    openedTab.delete(tab_id)
    setTabParamsCollection(tabParamsCollection.filter(tab=>tab.tabID !== tabID))
    if(activeTabID === tabID && tabParamsCollection.length){
      setActiveTabID(tabParamsCollection[0].tabID)
    }
  }
  const [activeTabID, setActiveTabID] = useState("")
  const [openTabDialog, setOpenTabDialog] = useState(false)
  
  const activeTabParams = tabParamsCollection.filter(param=>param.tabID === activeTabID)[0]
  // useEffect(()=>{
  //   setActiveTabParams(tabParamsCollection.filter(param=>param.tabID === activeTabID)[0])
  // },[tabParamsCollection, activeTabID])
  const activeBookName = activeTabParams?activeTabParams.bookName:null

  const handleClickEditTab = ()=>{
    setIsCreateNewTab(false)
    setOpenTabDialog(true)
  }

  const handleSetActiveTab = (tabID:string)=>{
    setActiveTabID(tabID)
  }

  const handleAddTab = ()=>{
    setIsCreateNewTab(true)
    setOpenTabDialog(true)
  }

  const handleIncrementChapter = ()=>{
    if(activeTabParams.chapter_ID < activeTabParams.books[activeTabParams.book_ID].chapters.length - 1){
      handleEditTab({...activeTabParams, chapter_ID:activeTabParams.chapter_ID+1})
    }
  }

  const handleDecrementChapter = ()=>{
    if(activeTabParams.chapter_ID > 0){
      handleEditTab({...activeTabParams, chapter_ID:activeTabParams.chapter_ID - 1})
    }
  }

  const [openMainMenu, setOpenMainMenu] = useState(false)

  const getVersionShortName = (name:string)=> name.split("_")[name.split("_").length - 1].toUpperCase()
  const navigate = useNavigate()
  return (
    <Box>
    {
      tabParamsCollection.length?
      <Box role="presentation" sx={{display:"flex", paddingLeft:2, alignItems:"center", overflowX:"auto"}}>
        <IconButton id="main_menu" color="primary" sx={{marginRight:2}} onClick={()=>setOpenMainMenu(true)}><MenuSharp /></IconButton>
        <SwipeableDrawer anchor="left" open={openMainMenu} onOpen={()=>setOpenMainMenu(true)} onClose={()=>setOpenMainMenu(false)}>
          <Box sx={{height:"100vh", width:250}}>
            <List onClick={()=>setOpenMainMenu(false)} onKeyDown={()=>setOpenMainMenu(false)}>
              <ListItem disablePadding>
                <ListItemButton onClick={()=>navigate("/histories")}>
                  <ListItemIcon><History /></ListItemIcon>
                  <ListItemText>Histories</ListItemText>
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><Note /></ListItemIcon>
                  <ListItemText>Notes</ListItemText>
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><SearchRounded /></ListItemIcon>
                  <ListItemText>Search</ListItemText>
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><HourglassBottomRounded /></ListItemIcon>
                  <ListItemText>Study Plan</ListItemText>
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><Settings /></ListItemIcon>
                  <ListItemText>Settings</ListItemText>
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </SwipeableDrawer>
        <>
        {
          tabParamsCollection.map((tab, id)=>
            <Fragment key={tab.tabID}>
              <Box key={tab.tabID+"box"} sx={{backgroundColor:tab.tabID===activeTabID?theme.palette.primary.main:"inherit", color:tab.tabID===activeTabID?"white":theme.palette.primary.main, paddingBottom:"2px", whiteSpace:"nowrap"}}>
                <Button onClick={()=>setActiveTabID(tab.tabID)} color={tab.tabID===activeTabID?"primary":"inherit"} variant={tab.tabID===activeTabID?"contained":undefined}>
                  {tab.bookName} {tab.chapter_ID+1} ({getVersionShortName(tab.versionAbbrev)})
                </Button>
                <TabMenu tabID={tab.tabID} activeTabID={activeTabID} handleSetActiveTab={handleSetActiveTab} handleClickEditTab={handleClickEditTab} handleDeleteTab={handleDeleteTab} />
              </Box>
              <Divider key={tab.tabID+"-divider"} orientation="vertical" flexItem role="presentation" />
            </Fragment>
          )
        }
          <Box>
            <IconButton color="primary" onClick={()=>handleAddTab()}><Add color="primary" /></IconButton>
          </Box>
        </>
      </Box>
        :
        <>
        <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", width:"100%", height:"100vh"}}>
          <Box sx={{width:"360px", maxWidth:"90%"}}>
            <Box sx={{marginBottom:10}}>
              <Typography variant="h4" textAlign="center" style={{color:theme.palette.primary.main, fontWeight:"bold"}} >Absolute Bible</Typography>
              <Typography textAlign="center" variant="body2">Multilingual & Multi-version such as:</Typography>
              <Typography color="secondary.light" textAlign="center" variant="subtitle2">MSG | AMP | NLT ...</Typography>
            </Box>
            <Card>
              <CardMedia component="img" image="bible-study.webp" sx={{height:"150px"}} alt="Read Bible" />
              <CardContent>
                <Typography gutterBottom variant="h5">Study</Typography>
                <Typography variant="body2" >Study to show yourself approve unto GOD ...</Typography>
              </CardContent>
              <CardActions>
                <Button onClick={()=>handleAddTab()} variant="contained">Open Bible</Button>
                <Button onClick={()=>navigate("/histories")}>App Histories</Button>
              </CardActions>
            </Card>
          </Box>
        </Box>
        </>
        }
      <Box>
        {activeTabParams?
        <Box>
          <Box sx={{paddingLeft:3, display:"flex", alignItems:"center"}}>
            <Typography  sx={{marginRight:2}}>{activeTabParams?.versionAbbrev.split("_").join(" ").toUpperCase()}</Typography>
            <Divider role="presentation" orientation="vertical" flexItem />
            <Box sx={{marginLeft:2, display:"flex", alignItems:"center"}}>{activeBookName?.slice(0, 3)} <IconButton onClick={()=>handleDecrementChapter()} size="small"><Remove /></IconButton> Ch {activeTabParams.chapter_ID+1} <IconButton onClick={()=>handleIncrementChapter()} size="small"><Add /></IconButton></Box>
          </Box>
          <Tab key={activeTabID} {...activeTabParams} />
        </Box>
        :null}
      </Box>
      {isCreateNewTab?
        <CreateTabDialog setTabParams={handleAddTabToDB} open={openTabDialog}></CreateTabDialog>
      :
        <EditTabDialog key={activeTabID} setTabParams={handleEditTab} open={openTabDialog} tabParams={activeTabParams}></EditTabDialog>
      }
    </Box>
  )
}
const CreateTabDialog:FC<{setTabParams:Function, open:boolean}> = ({setTabParams, open})=>{
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [selectedVersion, setSelectedVersion] = useState(bibleIndex[0].versions[0])
  const [books, setBooks] = useState<book[]>([])
  // Book here refers to the name of any book of the bible such as Genesis, Exodus, ... Revelation
  const [book_ID, setBook_ID] = useState(0)
  const languageVersions = bibleIndex.filter((obj)=>obj.language === selectedLanguage)[0].versions
  const [chapter_ID, setChapter_ID] = useState(0)

  const book = books[book_ID]
  const [openBooksDialog, setOpenBooksDialog] = useState(false)
  const chapters = book?book.chapters:[[]]
  const verses = chapters?chapters[chapter_ID]:null 

  const chapterNumber = chapter_ID>=0?chapter_ID+1:null
  const bookName = book?book.name:""
  
  useEffect(()=>{
    if(languageVersions?.length){
      setSelectedVersion(languageVersions[0])
    }
  }, [languageVersions])

  useEffect(()=>{
    fetchAndCommitBibleFile(selectedVersion, setBooks)
  }, [selectedVersion])

  useEffect(()=>{
    if(typeof book !== "undefined" && (book.chapters.length === 1 || chapter_ID >= book.chapters.length)){
      setChapter_ID(0)
    }
  }, [book, chapter_ID])
  // Fetch Books (Bible) of the selected version and assign to state
  
  const selectedBibleParams:addOpenedTab = {tabID:generateRandomKey(), bookName:bookName, versionAbbrev:selectedVersion.abbreviation, language:selectedLanguage, book_ID:book_ID, chapter_ID:chapter_ID}
  
  return(<Dialog open={open}>
    <DialogTitle>Open {selectedLanguage} Bible | {bookName} {chapterNumber} {selectedVersion.abbreviation.split("_")[selectedVersion.abbreviation.split("_").length - 1].toUpperCase()}</DialogTitle>
    <DialogContent tabIndex={1} sx={{width:"450px", maxWidth:"84%"}}>
      <Box sx={{paddingTop:2}}>
        <Box>
          <Languages collection={bibleIndex} handleSelect={setSelectedLanguage} selected={selectedLanguage} />
        </Box>
        <Box sx={{marginTop:2}}>
          <Typography>Versions</Typography>
          <Versions collection={languageVersions} selected={selectedVersion} handleSelect={setSelectedVersion} />
        </Box>
        <Box sx={{marginTop:2}}>
          <Typography>Book</Typography>
          <Button variant="outlined" onClick={()=>{setOpenBooksDialog(true)}}>{bookName} <ArrowDropDown /> </Button>
        </Box>
        <Box sx={{marginTop:2}}>
          <Typography>Chapters</Typography>
          <Chapters collection={chapters} selected={chapter_ID} handleSelect={(ev:Event, id:number)=>setChapter_ID(id)} />
        </Box>
        <Dialog open={openBooksDialog} onClose={()=>{setOpenBooksDialog(false)}} sx={{paddingLeft:.6, paddingTop:1, paddingBottom:2, maxHeight:"85vh", overflowY:"auto"}}>
          <Box sx={{padding:2}}>
            {books.map((book, id)=><Button sx={{margin:"2px"}} variant={book_ID===id?"contained":"outlined"} color={book_ID === id?"primary":undefined} key={book.abbrev} onClick={()=>{setOpenBooksDialog(false);if(setBook_ID)setBook_ID(id)}} size="small">{book.name}</Button>)}
          </Box>
        </Dialog>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button variant="outlined" onClick={()=>setTabParams()}>Close</Button>
      <Button color="primary" variant="contained" onClick={()=>{
        setTabParams(selectedBibleParams)
        }}>Done</Button>
    </DialogActions>
  </Dialog>)
}
const EditTabDialog:FC<{tabParams:tabModel, setTabParams:Function, open:boolean}> = ({tabParams, setTabParams, open})=>{
  const [selectedLanguage, setSelectedLanguage] = useState(tabParams.language)
  const [selectedVersion, setSelectedVersion] = useState(getVersionUsingLanguageAndAbbreviation(selectedLanguage, tabParams.versionAbbrev))
  const [books, setBooks] = useState<book[]>([])
  // Book here refers to the name of any book of the bible such as Genesis, Exodus, ... Revelation
  const [book_ID, setBook_ID] = useState(tabParams.book_ID)
  const languageVersions = bibleIndex.filter((obj)=>obj.language === selectedLanguage)[0].versions
  const [chapter_ID, setChapter_ID] = useState(tabParams.chapter_ID)

  const book = books[book_ID]
  const [openBooksDialog, setOpenBooksDialog] = useState(false)
  const chapters = book?book.chapters:[[]]

  const chapterNumber = chapter_ID+1
  const bookName = book?.name
  
  // useEffect(()=>{
  //   if(languageVersions?.length){
  //     setSelectedVersion(languageVersions[0])
  //   }
  // }, [languageVersions])

  useEffect(()=>{
    fetchAndCommitBibleFile(selectedVersion, setBooks)
  }, [selectedVersion])

  useEffect(()=>{
    if(typeof book !== "undefined" && (book.chapters.length === 1 || chapter_ID >= book.chapters.length)){
      setChapter_ID(0)
    }
  }, [book, chapter_ID])
  // Fetch Books (Bible) of the selected version and assign to state
  
  const selectedBibleParams:tabModel = {id:tabParams.id, tabID:tabParams.tabID, versionAbbrev:selectedVersion.abbreviation, language:selectedLanguage, book_ID:book_ID, chapter_ID:chapter_ID, bookName:bookName}
  
  return(<Dialog key={tabParams?.tabID} open={open}>
    <DialogTitle>Open {selectedLanguage} Bible | {bookName} {chapterNumber} {selectedVersion.name.split("_")[selectedVersion.name.split("_").length - 1].toUpperCase()}</DialogTitle>
    <DialogContent tabIndex={1} sx={{width:"450px", maxWidth:"84%"}}>
      <Box sx={{paddingTop:2}}>
        <Box>
          <Languages collection={bibleIndex} handleSelect={setSelectedLanguage} selected={selectedLanguage} />
        </Box>
        <Box sx={{marginTop:2}}>
          <Typography>Versions</Typography>
          <Versions collection={languageVersions} selected={selectedVersion} handleSelect={setSelectedVersion} />
        </Box>
        <Box sx={{marginTop:2}}>
          <Typography>Book</Typography>
          <Button variant="outlined" onClick={()=>{setOpenBooksDialog(true)}}>{bookName} <ArrowDropDown /> </Button>
        </Box>
        <Box sx={{marginTop:2}}>
          <Typography>Chapters</Typography>
          <Chapters collection={chapters} selected={chapter_ID} handleSelect={(ev:Event, id:number)=>setChapter_ID(id)} />
        </Box>
        <Dialog open={openBooksDialog} onClose={()=>{setOpenBooksDialog(false)}} sx={{paddingLeft:.6, paddingTop:1, paddingBottom:2, maxHeight:"85vh", overflowY:"auto"}}>
          <Box sx={{padding:2}}>
            {books.map((book, id)=><Button sx={{margin:"2px"}} variant={book_ID===id?"contained":"outlined"} color={book_ID === id?"primary":undefined} key={book.abbrev} onClick={()=>{setOpenBooksDialog(false);if(setBook_ID)setBook_ID(id)}} size="small">{book.name}</Button>)}
          </Box>
        </Dialog>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button variant="outlined" onClick={()=>setTabParams()}>Close</Button>
      <Button color="primary" variant="contained" onClick={()=>setTabParams(selectedBibleParams)}>Done</Button>
    </DialogActions>
  </Dialog>)
}
  const TabMenu:FC<{tabID:string, activeTabID:string, handleSetActiveTab:Function, handleClickEditTab:Function, handleDeleteTab:Function}> = ({tabID, activeTabID, handleSetActiveTab, handleClickEditTab, handleDeleteTab})=>{
    const [tabMenuAnchorElement, setTabMenuAnchorElement] = useState<null|HTMLElement>(null)
    const openTabMenu = Boolean(tabMenuAnchorElement)
    const handleOpenTabMenu = (ev:React.MouseEvent<HTMLButtonElement>)=>{
      setTabMenuAnchorElement(ev.currentTarget)
    }
    const handleClickEdit = ()=>{
      handleSetActiveTab(tabID)
      handleClickEditTab(tabID)
      setTabMenuAnchorElement(null)
    }
    return(
      <>
        <IconButton key={tabID+"handle"} size="small" color={tabID===activeTabID?"primary":"inherit"} sx={{color:"inherit"}} onClick={(ev)=>{handleOpenTabMenu(ev); }}><MoreVert fontSize="small" /></IconButton>
        <Menu key={tabID+"menu"} anchorEl={tabMenuAnchorElement} onClose={()=>setTabMenuAnchorElement(null)} open={openTabMenu}>
          <MenuItem onClick={()=>{handleClickEdit()}}>
            <ListItemIcon><Edit /></ListItemIcon>
            <ListItemText sx={{paddingRight:20}}>Edit tab</ListItemText>
          </MenuItem>
          <MenuItem onClick={()=>handleDeleteTab(tabID)}>
            <ListItemIcon><Delete /></ListItemIcon>
            <ListItemText>Delete this tab</ListItemText>
          </MenuItem>
        </Menu>
      </>
    )
  }