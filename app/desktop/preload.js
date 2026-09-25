// Secure bridge: the renderer gets only these explicit, serializable APIs.
'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('missionControl', {
  getState: () => ipcRenderer.invoke('state:get'),
  onUpdate: (cb) => {
    const handler = (_event, state) => cb(state);
    ipcRenderer.on('state:updated', handler);
    return () => ipcRenderer.removeListener('state:updated', handler);
  },
});
