const domino = require('domino');
Object.assign(global, domino.impl);
const win = domino.createWindow('/');
(global as any).window = win;
(global as any).document = win.document;
