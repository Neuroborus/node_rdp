const { app, BrowserWindow, ipcMain } = require('electron');
const { v4: uuidv4 } = require('uuid');
const screenshot = require('screenshot-desktop');
let robot = require('robotjs');
const { PORT } = require('../utils');
const internalIp = require('internal-ip');

let socket;
let myIp;
let host;
let interval;

async function prepare() {
  myIp = await internalIp.v4();
  host = 'http://' + myIp + ':' + PORT;
}

function createWindow() {
  (async () => {
    await prepare();
  })();

  console.log('Host: ' + host);
  socket = require('socket.io-client')(host);
  const win = new BrowserWindow({
    width: 500,
    height: 150,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.removeMenu();
  win.loadFile('index.html');

  socket.on('mouse-move', function (data) {
    let obj = JSON.parse(data);
    let x = obj.x;
    let y = obj.y;

    robot.moveMouse(x, y);
  });

  socket.on('mouse-click', function (data) {
    robot.mouseClick();
  });

  socket.on('type', function (data) {
    let obj = JSON.parse(data);
    let key = obj.key;

    robot.keyTap(key);
  });
}

app.whenReady().then(prepare).then(createWindow);

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

ipcMain.on('start-share', function (event, arg) {
  let uuid = 'test'; //uuidv4();
  socket.emit('join-message', uuid);
  event.reply('uuid', uuid);

  interval = setInterval(function () {
    screenshot().then((img) => {
      let imgStr = Buffer.from(img).toString('base64');

      let obj = {};
      obj.room = uuid;
      obj.image = imgStr;

      socket.emit('screen-data', JSON.stringify(obj));
    });
  }, 500);
});

ipcMain.on('stop-share', function (event, arg) {
  clearInterval(interval);
});
