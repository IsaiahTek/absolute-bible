import { useEffect, useState } from 'react'
import { Button } from '@mui/material';
export const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };
  if (!supportsPWA) {
    return null;
  }
  return (
    <Button
      id="setup_button"
      aria-label="Install app"
      title="Install app"
      variant='contained'
      color='success'
      onClick={onClick}
      sx={{position:"absolute", top:"6px", right:"5px"}}
    >
      Install App
    </Button>
  );
};
  
export const LogInstallationSuccessEvent = (fn)=>{
  window.addEventListener("appinstalled", fn) 
}