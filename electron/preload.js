const { contextBridge, ipcRenderer } = require('electron');

// We use contextBridge to safely expose specific features to the website
// without giving the website full access to your computer's system.

contextBridge.exposeInMainWorld('electron', {
  // Example: If you wanted to add a "Quit App" button in your React UI later:
  // quitApp: () => ipcRenderer.send('quit-app'),
  
  // For now, we leave this empty or add basic info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});