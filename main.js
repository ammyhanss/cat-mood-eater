const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

// Use dynamic import for electron-store (ESM module)
let Store;
let store;

async function loadStore() {
  const { default: ElectronStore } = await import('electron-store');
  Store = ElectronStore;
  store = new Store({
    defaults: { entries: [] }
  });
}

let widgetWindow = null;
let editorWindow = null;

function createWidgetWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  widgetWindow = new BrowserWindow({
    width: 230,
    height: 270,
    x: width - 250,
    y: height - 290,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    // 極簡模式：關閉系統材質，避免整塊底板感
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  widgetWindow.loadFile('widget.html');
  widgetWindow.setIgnoreMouseEvents(false);

  // Make it draggable but also keep it on secondary + full-screen spaces
  widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
}

function createEditorWindow() {
  if (editorWindow) {
    editorWindow.show();
    editorWindow.focus();
    return;
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  editorWindow = new BrowserWindow({
    width: 460,
    height: 380,
    x: Math.round(width / 2 - 230),
    y: Math.round(height / 2 - 190),
    frame: true,
    transparent: false,
    alwaysOnTop: true,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1008',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  editorWindow.loadFile('editor.html');
  // Force focus after load so editor is never hidden behind other windows
  editorWindow.webContents.once('did-finish-load', () => {
    editorWindow.show();
    editorWindow.focus();
    app.focus({ steal: true });
  });

  editorWindow.on('closed', () => {
    editorWindow = null;
  });
}

// IPC handlers
ipcMain.on('open-editor', () => {
  createEditorWindow();
});

ipcMain.on('save-entry', async (event, text) => {
  if (!text || !text.trim()) return;
  const entries = store.get('entries', []);
  entries.push({
    id: Date.now().toString(),
    text: text.trim(),
    date: new Date().toISOString().slice(0, 10),
    timestamp: Date.now()
  });
  store.set('entries', entries);

  // Notify widget to animate and update count
  if (widgetWindow) {
    widgetWindow.webContents.send('feed-cat');
  }

  // Close editor after saving
  if (editorWindow) {
    editorWindow.close();
  }
});

ipcMain.handle('get-today-count', async () => {
  const today = new Date().toISOString().slice(0, 10);
  const entries = store.get('entries', []);
  return entries.filter(e => e.date === today).length;
});

ipcMain.handle('get-all-entries', async () => {
  return store.get('entries', []);
});

app.whenReady().then(async () => {
  await loadStore();
  createWidgetWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWidgetWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
