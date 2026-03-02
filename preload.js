const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('catAPI', {
    openEditor: () => ipcRenderer.send('open-editor'),
    saveEntry: (text) => ipcRenderer.send('save-entry', text),
    getTodayCount: () => ipcRenderer.invoke('get-today-count'),
    getAllEntries: () => ipcRenderer.invoke('get-all-entries'),
    onFeedCat: (callback) => ipcRenderer.on('feed-cat', callback),
});
