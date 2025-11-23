const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Interwise",
    // Sets the icon for the window title bar and taskbar
    icon: path.join(__dirname, '../public/favicon.ico'), 
    webPreferences: {
      nodeIntegration: false, // Security: Keep false
      contextIsolation: true, // Security: Keep true
      preload: path.join(__dirname, 'preload.js'), // Load the preload script
    },
    autoHideMenuBar: true, // Hides the default File/Edit menu
  });

  // ---------------------------------------------------------
  // ⚠️ ACTION REQUIRED: REPLACE THE URL BELOW
  // ---------------------------------------------------------
  // If you are testing locally, you can use 'http://localhost:3000'
  // For the final EXE, use your real Vercel URL.
  const startUrl = 'https://interwise-16oj.vercel.app/'; 
  
  console.log("Loading Interwise from:", startUrl);
  mainWindow.loadURL(startUrl);

  // Open external links (like "Learn More") in the default browser, not the app window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Electron initialization
app.on('ready', createWindow);

// Quit when all windows are closed (except on Mac)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // Re-create window if dock icon is clicked (Mac behavior)
  if (mainWindow === null) {
    createWindow();
  }
});