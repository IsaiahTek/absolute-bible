/* eslint-disable react-hooks/set-state-in-effect */
import bibleIndex from "./bible_versions/bible-master/json/index.json"
import { Chapters, Languages, LoadingNotifier, Tab, getVersionUsingLanguageAndAbbreviation } from './pages/components'
import { type FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Card, CardActions, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography, createTheme } from '@mui/material'
import { Add, ArrowDropDown, Edit, MoreVert, Remove } from '@mui/icons-material'
// import { initializeApp } from "firebase/app";
// import { getAnalytics, logEvent } from "firebase/analytics";
// import { LogInstallationSuccessEvent } from './pages/InstallApp'
import React from 'react'
import { generateRandomKey } from "./string_helper"
import { fetchAndCommitBibleFile, fetchBible } from "./adapters"
import { useNavigate } from "react-router-dom"
import { OpenedTab } from "./models/OpenedTabModel"

// Firebase config
// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_API_KEY,
//   authDomain: "absolute-bible.firebaseapp.com",
//   projectId: "absolute-bible",
//   storageBucket: "absolute-bible.appspot.com",
//   messagingSenderId: "127365858543",
//   appId: "1:127365858543:web:81bbfbf019fecc1e9c071a",
//   measurementId: "G-QJFGX9BG5T"
// };

// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// LogInstallationSuccessEvent(() => logEvent(analytics, "pwa_installed", { "pwa_installed": true }))

// ------------------- Types -------------------
type versionsProps = {
  collection: { name: string; abbreviation: string }[]
  selected: { name: string; abbreviation: string } | undefined
  handleSelect: (version: { name: string; abbreviation: string }) => void
}

type CreateTabDialogProps = {
  setTabParams: (tab?: AddOpenedTab) => void
  open: boolean
}

type EditTabDialogProps = {
  tabParams: TabModel
  setTabParams: (tab?: TabModel | OpenedTab) => void
  open: boolean
}

type TabMenuProps = {
  id: number
  tabID: string
  activeTabID: string
  handleSetActiveTab: (tabID: string) => void
  handleClickEditTab: (tabID: string) => void
  handleDeleteTab: (tab_id: number, tabID: string) => void
}

// ------------------- Versions Component -------------------
export const Versions: FC<versionsProps> = ({ collection, selected, handleSelect }) => {
  const getLastStringPart = (str: string) => str.split("_").pop()!
  return (
    <Box>
      {collection.map(version =>
        <Button
          sx={{ marginRight: 1, marginBottom: 1 }}
          variant={version.name === selected?.name ? "contained" : "outlined"}
          key={version.name}
          onClick={() => handleSelect(version)}
        >
          {getLastStringPart(version.abbreviation)}
        </Button>
      )}
    </Box>
  )
}

// ------------------- Home Component -------------------
export default function Home() {

  const theme = useMemo(() => createTheme({
    palette: {
      primary: { main: "#304e00", dark: "#1c2e00", light: "#cfeca2" },
      secondary: { main: "#00d5d1", dark: "#00aba7", light: "#bbaba7" }
    }
  }), [])

  const openedTab = useMemo(() => new OpenedTab(), [])

  const [isLoading, setIsLoading] = useState(true)
  const [tabParamsCollection, setTabParamsCollection] = useState<ResolvedOpenedTab[]>([])
  const [activeTabID, setActiveTabID] = useState("")
  const [isCreateNewTab, setIsCreateNewTab] = useState(true)
  const [openTabDialog, setOpenTabDialog] = useState(false)
  
  const handleSetActiveTab = (tabID: string) => {
    setActiveTabID(tabID)
    localStorage.setItem("activeTabID", tabID)
  }
  const fetchAndCommitOpenedTabs = useCallback((offset?: number, amount?: number) => {
    openedTab.fetch(offset, amount).then(async (result) => {
      const computedTabsWithBooks = []
      for (let i = 0; i < result.length; i++) {
        const res = result[i]
        const books = await fetchBible(getVersionUsingLanguageAndAbbreviation(res.language, res.versionAbbrev))
        computedTabsWithBooks.push({ books, ...res })
      }
      setTabParamsCollection(computedTabsWithBooks)
      if (result.length) handleSetActiveTab(localStorage.getItem("activeTabID") || result[0].tabID)
      setIsLoading(false)
    })
  }, [openedTab])

  useEffect(() => { fetchAndCommitOpenedTabs() }, [fetchAndCommitOpenedTabs])


  const handleAddTabToDB = (tab?: AddOpenedTab | undefined) => {
    if (tab) {
      openedTab.add(tab).then(() => fetchAndCommitOpenedTabs())
      handleSetActiveTab(tab.tabID)
      setIsCreateNewTab(false)
    }
    setOpenTabDialog(false)
  }

  const handleEditTab = (tab?: OpenedTab | TabModel) => {
    setIsCreateNewTab(false)
    if (tab) openedTab.update(tab as unknown as TabModel).then(() => fetchAndCommitOpenedTabs())
    setOpenTabDialog(false)
  }

  const handleDeleteTab = (tab_id: number, tabID: string) => {
    openedTab.delete(tab_id)
    setTabParamsCollection(tabParamsCollection.filter(tab => tab.tabID !== tabID))
    if (activeTabID === tabID && tabParamsCollection.length) handleSetActiveTab(tabParamsCollection[0].tabID)
  }

  const handleAddTab = () => { setIsCreateNewTab(true); setOpenTabDialog(true) }
  const handleClickEditTab = () => { setIsCreateNewTab(false); setOpenTabDialog(true) }

  const activeTabParams = tabParamsCollection.find(param => param.tabID === activeTabID)
  const book_ID = activeTabParams?.book_ID ?? 0
  const books = activeTabParams?.books
  const chapter_ID = activeTabParams?.chapter_ID ?? 0
  const activeChaptersLength = books?.[book_ID]?.chapters?.length ?? 0
  const activeBookName = activeTabParams?.bookName
  const navigate = useNavigate()

  const handleIncrementChapter = () => {
    if (activeTabParams && activeTabParams.chapter_ID < activeTabParams.books[activeTabParams.book_ID].chapters.length - 1)
      handleEditTab({ ...activeTabParams, chapter_ID: activeTabParams.chapter_ID + 1 })
  }

  const handleDecrementChapter = () => {
    if (activeTabParams && activeTabParams.chapter_ID > 0)
      handleEditTab({ ...activeTabParams, chapter_ID: activeTabParams.chapter_ID - 1 })
  }

  const getVersionShortName = (name: string) => name.split("_").pop()?.toUpperCase()

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      {isLoading ?
        <LoadingNotifier /> :
        tabParamsCollection.length ?
          <Box role="presentation" sx={{ display: "flex", paddingLeft: 5, marginLeft: 2, alignItems: "center", overflowX: "auto", backgroundColor: "transparent" }}>
            {tabParamsCollection.map(tab =>
              <Fragment key={tab.tabID}>
                <Box sx={{ backgroundColor: tab.tabID === activeTabID ? theme.palette.primary.main : "inherit", color: tab.tabID === activeTabID ? "white" : theme.palette.primary.main, paddingBottom: "2px", whiteSpace: "nowrap" }}>
                  <Button onClick={() => handleSetActiveTab(tab.tabID)} color={tab.tabID === activeTabID ? "primary" : "inherit"} variant={tab.tabID === activeTabID ? "contained" : undefined}>
                    {tab.bookName} {tab.chapter_ID + 1} ({getVersionShortName(tab.versionAbbrev)})
                  </Button>
                  <TabMenu id={tab.id} tabID={tab.tabID} activeTabID={activeTabID} handleSetActiveTab={handleSetActiveTab} handleClickEditTab={handleClickEditTab} handleDeleteTab={handleDeleteTab} />
                </Box>
                <Divider orientation="vertical" flexItem />
              </Fragment>
            )}
            <Box><IconButton color="primary" onClick={handleAddTab}><Add /></IconButton></Box>
          </Box>
          :
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh" }}>
            <Box sx={{ width: "360px", maxWidth: "90%" }}>
              <Box sx={{ marginBottom: 10 }}>
                <Typography variant="h4" textAlign="center" style={{ color: theme.palette.primary.main, fontWeight: "bold" }}>Absolute Bible</Typography>
                <Typography textAlign="center" variant="body2" color="green">Multilingual & Multi-version such as:</Typography>
                <Typography color="secondary.light" textAlign="center" variant="subtitle2">MSG | AMP | NLT ...</Typography>
              </Box>
              <Card>
                <CardMedia component="img" image="bible-study.webp" sx={{ height: "150px" }} alt="Read Bible" />
                <CardContent>
                  <Typography gutterBottom variant="h5">Study</Typography>
                  <Typography variant="body2" >Study to show yourself approve unto GOD ...</Typography>
                </CardContent>
                <CardActions sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button onClick={handleAddTab} variant="contained">Open Bible</Button>
                  <Button variant="outlined" onClick={() => navigate("/search")}>Search Bible</Button>
                </CardActions>
              </Card>
            </Box>
          </Box>
      }

      {activeTabParams &&
        <Box>
          <Box sx={{ paddingLeft: 3, display: "flex", alignItems: "center" }}>
            <Typography sx={{ marginRight: 2 }}>{activeTabParams.versionAbbrev.split("_").join(" ").toUpperCase()}</Typography>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ marginLeft: 2, display: "flex", alignItems: "center" }}>
              {activeBookName?.slice(0, 3)}
              <IconButton disabled={chapter_ID <= 0} color={chapter_ID > 0 ? "primary" : undefined} onClick={handleDecrementChapter} size="small"><Remove /></IconButton>
              Ch {chapter_ID + 1}
              <IconButton color={activeChaptersLength - 1 > chapter_ID ? "primary" : undefined} onClick={handleIncrementChapter} size="small" disabled={activeChaptersLength - 1 <= chapter_ID}><Add /></IconButton>
            </Box>
          </Box>
          <Tab key={activeTabID} {...activeTabParams} />
        </Box>
      }

      {isCreateNewTab ?
        <CreateTabDialog setTabParams={handleAddTabToDB} open={openTabDialog} /> :
        activeTabParams ?
          <EditTabDialog key={activeTabID} setTabParams={handleEditTab} open={openTabDialog} tabParams={activeTabParams} /> :
          null
      }
    </Box>
  )
}

// ------------------- CreateTabDialog Component -------------------
const CreateTabDialog: FC<CreateTabDialogProps> = ({ setTabParams, open }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [selectedVersion, setSelectedVersion] = useState(bibleIndex[0].versions[0])
  const [books, setBooks] = useState<Book[]>([])
  const [book_ID, setBook_ID] = useState(0)
  const languageVersions = useMemo(() => bibleIndex.find(obj => obj.language === selectedLanguage)?.versions ?? [], [selectedLanguage] )
  const [chapter_ID, setChapter_ID] = useState(0)

  const book = books[book_ID]
  const chapters = book?.chapters ?? [[]]
  const chapterNumber = chapter_ID >= 0 ? chapter_ID + 1 : null
  const bookName = book?.name ?? ""

  useEffect(() => { if (languageVersions.length) setSelectedVersion(languageVersions[0]) }, [languageVersions])
  useEffect(() => { fetchAndCommitBibleFile(selectedVersion, setBooks) }, [selectedVersion])
  useEffect(() => { if (book && (book.chapters.length === 1 || chapter_ID >= book.chapters.length)) setChapter_ID(0) }, [book, chapter_ID])

  const selectedBibleParams: AddOpenedTab = { tabID: generateRandomKey(), bookName, versionAbbrev: selectedVersion.abbreviation, language: selectedLanguage, book_ID, chapter_ID }
  const [openBooksDialog, setOpenBooksDialog] = useState(false)

  return (
    <Dialog open={open}>
      <DialogTitle>Open {selectedLanguage} Bible | {bookName} {chapterNumber} {selectedVersion.abbreviation.split("_").pop()?.toUpperCase()}</DialogTitle>
      <DialogContent tabIndex={1} sx={{ width: "450px", maxWidth: "84%" }}>
        <Box sx={{ paddingTop: 2 }}>
          <Languages collection={bibleIndex} handleSelect={setSelectedLanguage} selected={selectedLanguage} />
          <Box sx={{ marginTop: 2 }}>
            <Typography>Versions</Typography>
            <Versions collection={languageVersions} selected={selectedVersion} handleSelect={setSelectedVersion} />
          </Box>
          <Box sx={{ marginTop: 2 }}>
            <Typography>Book</Typography>
            <Button variant="outlined" onClick={() => setOpenBooksDialog(true)}>{bookName} <ArrowDropDown /> </Button>
          </Box>
          <Box sx={{ marginTop: 2 }}>
            <Typography>Chapters</Typography>
            <Chapters collection={chapters} selected={chapter_ID} handleSelect={(id: number) => setChapter_ID(id)} />
          </Box>
          <Dialog open={openBooksDialog} onClose={() => setOpenBooksDialog(false)} sx={{ paddingLeft: .6, paddingTop: 1, paddingBottom: 2, maxHeight: "85vh", overflowY: "auto" }}>
            <Box sx={{ padding: 2 }}>
              {books.map((book, id) =>
                <Button sx={{ margin: "2px" }} variant={book_ID === id ? "contained" : "outlined"} color={book_ID === id ? "primary" : undefined} key={book.abbrev} onClick={() => { setOpenBooksDialog(false); setBook_ID(id) }} size="small">{book.name}</Button>
              )}
            </Box>
          </Dialog>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setTabParams()}>Close</Button>
        <Button color="primary" variant="contained" onClick={() => setTabParams(selectedBibleParams)}>Done</Button>
      </DialogActions>
    </Dialog>
  )
}

// ------------------- EditTabDialog Component -------------------
const EditTabDialog: FC<EditTabDialogProps> = ({ tabParams, setTabParams, open }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(tabParams.language)
  const [selectedVersion, setSelectedVersion] = useState(getVersionUsingLanguageAndAbbreviation(selectedLanguage, tabParams.versionAbbrev))
  const [books, setBooks] = useState<Book[]>([])
  const [book_ID, setBook_ID] = useState(tabParams.book_ID)
  const languageVersions = bibleIndex.find(obj => obj.language === selectedLanguage)?.versions ?? []
  const [chapter_ID, setChapter_ID] = useState(tabParams.chapter_ID)

  const book = books[book_ID]
  const chapters = book?.chapters ?? [[]]
  const chapterNumber = chapter_ID + 1
  const bookName = book?.name

  useEffect(() => { fetchAndCommitBibleFile(selectedVersion, setBooks) }, [selectedVersion])
  useEffect(() => { if (book && (book.chapters.length === 1 || chapter_ID >= book.chapters.length)) setChapter_ID(0) }, [book, chapter_ID])
  const [openBooksDialog, setOpenBooksDialog] = useState(false)

  const selectedBibleParams: TabModel = { id: tabParams.id, tabID: tabParams.tabID, versionAbbrev: selectedVersion.abbreviation, language: selectedLanguage, book_ID, chapter_ID, bookName }

  return (
    <Dialog key={tabParams.tabID} open={open}>
      <DialogTitle>Open {selectedLanguage} Bible | {bookName} {chapterNumber} {selectedVersion.name.split("_").pop()?.toUpperCase()}</DialogTitle>
      <DialogContent tabIndex={1} sx={{ width: "450px", maxWidth: "84%" }}>
        <Languages collection={bibleIndex} handleSelect={setSelectedLanguage} selected={selectedLanguage} />
        <Box sx={{ marginTop: 2 }}>
          <Typography>Versions</Typography>
          <Versions collection={languageVersions} selected={selectedVersion} handleSelect={setSelectedVersion} />
        </Box>
        <Box sx={{ marginTop: 2 }}>
          <Typography>Book</Typography>
          <Button variant="outlined" onClick={() => setOpenBooksDialog(true)}>{bookName} <ArrowDropDown /> </Button>
        </Box>
        <Box sx={{ marginTop: 2 }}>
          <Typography>Chapters</Typography>
          <Chapters collection={chapters} selected={chapter_ID} handleSelect={(id: number) => setChapter_ID(id)} />
        </Box>
        <Dialog open={openBooksDialog} onClose={() => setOpenBooksDialog(false)} sx={{ paddingLeft: .6, paddingTop: 1, paddingBottom: 2, maxHeight: "85vh", overflowY: "auto" }}>
          <Box sx={{ padding: 2 }}>
            {books.map((book, id) =>
              <Button sx={{ margin: "2px" }} variant={book_ID === id ? "contained" : "outlined"} color={book_ID === id ? "primary" : undefined} key={book.abbrev} onClick={() => { setOpenBooksDialog(false); setBook_ID(id) }} size="small">{book.name}</Button>
            )}
          </Box>
        </Dialog>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setTabParams()}>Close</Button>
        <Button color="primary" variant="contained" onClick={() => setTabParams(selectedBibleParams)}>Done</Button>
      </DialogActions>
    </Dialog>
  )
}

// ------------------- TabMenu Component -------------------
const TabMenu: FC<TabMenuProps> = ({ id, tabID, handleClickEditTab, handleDeleteTab }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  return (
    <>
      <IconButton aria-label="more" aria-controls={open ? 'long-menu' : undefined} aria-haspopup="true" onClick={handleClick}><MoreVert /></IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => { handleClickEditTab(tabID); handleClose() }}><ListItemIcon><Edit /></ListItemIcon>Edit</MenuItem>
        <MenuItem onClick={() => { handleDeleteTab(id, tabID); handleClose() }}><ListItemIcon><Remove /></ListItemIcon>Delete</MenuItem>
      </Menu>
    </>
  )
}
