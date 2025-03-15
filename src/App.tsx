// import { invoke } from '@tauri-apps/api/tauri'
import { 
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from 'react-router-dom';
import { Box, Button, ThemeProvider, createTheme} from '@mui/material'
import React from 'react'
import Home from './Home';
import { HistoriesPage } from './pages/TabHistory';
import { SearchPage } from './pages/SearchPage';
import { AppMenu } from './pages/components';
import { Backspace } from '@mui/icons-material';

function DynamicTopMenu(){
  const currentPageName = window.location.pathname;
  if(currentPageName !== "/"){
    return (
      <Box sx={{backgroundColor:"white", display:"flex", paddingLeft:2, alignItems:"center", overflowX:"auto", marginBottom:1}}>
        <AppMenu />
        <Box sx={{backgroundColor:"white", paddingY:.8, position:"fixed", zIndex:5, top:0, left:60, width:"90vw"}}>
            <Button size="small" onClick={()=>window.history.back()}><Backspace fontSize="small" sx={{marginRight:1}} /> Back</Button>
        </Box>
    </Box>
    )
  }else{
    return (<AppMenu />);
  }
}

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
      
        <DynamicTopMenu />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/histories' element={<HistoriesPage />} />
          <Route path='/search' element={<SearchPage />} />
        </Routes>
      </ThemeProvider>
    </Router>
  )
}