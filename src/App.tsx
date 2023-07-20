// import { invoke } from '@tauri-apps/api/tauri'
import { 
  HashRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import { ThemeProvider, createTheme} from '@mui/material'
import React from 'react'
import Home from './Home';
import { HistoriesPage } from './pages/TabHistory';

export default function App() {  
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
  
  return (
    <Router>
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/histories' element={<HistoriesPage />} />
      </Routes>
    </ThemeProvider>
    </Router>
  )
}