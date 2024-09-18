const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;  // Make sure to use fs.promises
const ExifReader = require('exifreader');
const util = require('util');
const readdir = util.promisify(fs.readdir);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (!canceled) {
    return filePaths[0];
  }
});

ipcMain.handle('fs:readDirectory', async (event, dirPath) => {
  console.log('Attempting to read directory:', dirPath);
  try {
    await fs.access(dirPath); // This will throw an error if the directory doesn't exist
    const files = await fs.readdir(dirPath);
    console.log('Files found:', files);
    return files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
});

ipcMain.handle('fs:readFile', async (event, path) => {
  try {
    const data = await fs.readFile(path);
    return data.toString('base64');
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
});

ipcMain.handle('fs:getImageMetadata', async (event, path) => {
  try {
    const buffer = await fs.readFile(path);
    const tags = await ExifReader.load(buffer);
    return {
      date: tags['DateTimeOriginal']?.description || 'Unknown',
      time: tags['DateTimeOriginal']?.description?.split(' ')[1] || 'Unknown',
      location: tags['GPSLatitude']?.description && tags['GPSLongitude']?.description
        ? `${tags['GPSLatitude'].description}, ${tags['GPSLongitude'].description}`
        : 'Unknown',
      camera: tags['Model']?.description || 'Unknown',
      lens: tags['LensModel']?.description || 'Unknown',
      iso: tags['ISOSpeedRatings']?.description || 'Unknown',
      aperture: tags['FNumber']?.description || 'Unknown',
      shutterSpeed: tags['ExposureTime']?.description || 'Unknown',
    };
  } catch (error) {
    console.error('Error reading image metadata:', error);
    return {
      date: 'Unknown',
      time: 'Unknown',
      location: 'Unknown',
      camera: 'Unknown',
      lens: 'Unknown',
      iso: 'Unknown',
      aperture: 'Unknown',
      shutterSpeed: 'Unknown',
    };
  }
});
