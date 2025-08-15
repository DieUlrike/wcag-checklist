const { autoUpdater } = require('electron-updater');
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  // Nach Updates suchen und ggf. installieren
  autoUpdater.checkForUpdatesAndNotify();

  // Logs für Update-Status
  autoUpdater.on('update-available', () => {
    console.log('Update verfügbar – Download startet.');
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('Update fertig – Neustart und Installation.');
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('error', (err) => {
    console.error('Auto-Update-Fehler:', err);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
