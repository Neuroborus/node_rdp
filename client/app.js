const { app, BrowserWindow, ipcMain } = require('electron');
const { v4: uuidv4 } = require('uuid');
const screenshot = require('screenshot-desktop');
const robot = require('robotjs');
const { PORT } = require('../utils/utils');
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
    width: 370,
    height: 150,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.removeMenu();
  win.loadFile('index.html');

  socket.on('mouse-move', function (data) {
    const obj = JSON.parse(data);
    const x = obj.x;
    const y = obj.y;

    robot.moveMouse(x, y);
  });

  socket.on('mouse-down', function (data) {
      robot.mouseToggle("down");
  });

  socket.on('mouse-up', function (data) {
      robot.mouseToggle("up");
  });

  socket.on('mouse-click', function (data) {
    robot.mouseClick();
  });
  
  socket.on('mouse-right-click', function (data) {
    robot.mouseClick("right");
  });

  socket.on('type', function (data) {
    const key = data.toLowerCase();
    try {
      robot.keyTap(key);
    } catch (ex) {
      console.error("key error: " + key);
    }
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
  const uuid = Math.random().toString(36).substring(2, 7);
  socket.emit('join-message', uuid);
  event.reply('control-link', host + '/control');
  event.reply('uuid', uuid);

  interval = setInterval(function () {
    screenshot().then((img) => {
      const imgStr = Buffer.from(img).toString('base64');

      const obj = {};
      obj.room = uuid;
      obj.image = imgStr;

      socket.emit('screen-data', JSON.stringify(obj));
    });
  }, 500);
});

ipcMain.on('stop-share', function (event, arg) {
  clearInterval(interval);
});
