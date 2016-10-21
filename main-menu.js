const Menu = require('electron').Menu;

module.exports = function setupMainMenu(app) {
  const template = [{
    label: 'Application',
    submenu: [
            {label: 'About Application', selector: 'orderFrontStandardAboutPanel:'},
            {type: 'separator'},
            {label: 'Quit', accelerator: 'Command+Q', click: function quit() { app.quit(); }},
    ]}, {
      label: 'Edit',
      submenu: [
            {label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:'},
            {label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:'},
            {type: 'separator'},
            {label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:'},
            {label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:'},
            {label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:'},
            {label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:'},
      ]},
    ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};
