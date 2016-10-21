const Promise = require('bluebird');
const electron = require('electron');  // eslint-ignore-line no-unresolved
const path = require('path');
const app = electron.app;
const globalShortcut = electron.globalShortcut;
const BrowserWindow = electron.BrowserWindow;
const NativeImage = electron.nativeImage;
const setupMainMenu = require('./main-menu');

let mainWindow = null;
let lastNowPlaying = null;

const nowPlayingJavaScript = (
  '[].slice.call(document.querySelectorAll("' +
    "[ng-bind='player.nowPlaying.currentDisplayTrack.artist']," +
    "[ng-bind='player.nowPlaying.currentDisplayTrack.title']" +
  "\")).map(function(e){return e.innerText}).join(' - ')"
);

const castNameJavaScript = (
  '[].slice.call(document.querySelectorAll("' +
  "[ng-bind='player.currentCloudcast.owner']," +
  "[ng-bind='player.currentCloudcast.title']" +
  "\")).map(function(e){return e.innerText}).join(' - ')"
);


function execJS(code) {
  return new Promise(function jsPromiseResolver(resolve, reject) {
    if (!mainWindow) {
      reject('no main window');
      return;
    }
    mainWindow.webContents.executeJavaScript(code, true, resolve);
  });
}

function updateTitle() {
  if (!mainWindow) return;
  Promise.props({
    nowPlaying: execJS(nowPlayingJavaScript),
    castName: execJS(castNameJavaScript),
  }).then(function handleUpdate(result) {
    const newTitleBits = [
      result.nowPlaying,
      result.castName,
    ].filter(function lengthFilter(x) {
      return (x && x.length >= 5);
    });
    const newTitle = (newTitleBits.concat(['Mixcloud']).join(' \u2014 '));
    mainWindow.setTitle(newTitle);
    const newNowPlaying = newTitleBits.join('\n');
    if (newNowPlaying.length > 5 && newNowPlaying !== lastNowPlaying) {
      lastNowPlaying = newNowPlaying;
      execJS('new Notification("Mixcloud", ' +
        JSON.stringify({body: newNowPlaying, silent: true}) +
      ');');
    }
  });
}


function createWindow() {
  const icon = path.join(__dirname, 'icon.ico');
  if (app && app.dock) {
    app.dock.setIcon(NativeImage.createFromPath(icon));
  }
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: icon,
    webPreferences: {
      nodeIntegration: false,  // Required for cookie support
    },
  });
  mainWindow.loadURL('https://mixcloud.com/');
  mainWindow.on('closed', function onClose() {
    mainWindow = null;
  });
  setupMainMenu(app);
  globalShortcut.register('MediaPlayPause', function handlePlayPause() {
    if (!mainWindow) return;
    execJS("$('.player-control').click()").then(updateTitle);
  });

  setInterval(updateTitle, 5000);
}


if (app.makeSingleInstance(function handleOtherInstance() {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
})) {
  app.quit();
} else {
  app.on('ready', createWindow);
  app.on('window-all-closed', function quit() {
    app.quit();
  });
}
