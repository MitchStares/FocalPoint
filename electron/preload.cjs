const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  readDirectory: (path) => ipcRenderer.invoke('fs:readDirectory', path),
  readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
  getImageMetadata: (path) => ipcRenderer.invoke('fs:getImageMetadata', path),
});
