const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('oxo', {
  newGame: (opts) => ipcRenderer.invoke('oxo:rpc', { method: 'new_game', params: opts || {} }),
  move: (cell) => ipcRenderer.invoke('oxo:rpc', { method: 'move', params: { cell } }),
  aiMove: () => ipcRenderer.invoke('oxo:rpc', { method: 'ai_move', params: {} }),
  state: () => ipcRenderer.invoke('oxo:rpc', { method: 'state', params: {} }),
});
