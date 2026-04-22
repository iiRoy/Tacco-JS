'use strict'; // This directive enforces strict mode for the entire script.

var app = require('app');         // Electron's main application module.
var BrowserWindow = require('browser-window'); // Module to create native browser windows.

/**
 * Global reference to the main window object.
 *   It is crucial to keep this reference.
 * If not, the window instance would be garbage collected (GCed)
 *   as soon as the JavaScript object goes out of scope,
 *      leading to unexpected window closure.
 */

var win = null; // Initialize the window variable to null.

/*
 * Event handler for when all application windows are closed.
 * This is a standard Electron lifecycle event.
 */

app.on(
  'window-all-closed',
  function () {
    // On macOS (darwin), applications generally stay active
    // in the menu bar even after all windows are closed.
    // So, we only quit the application explicitly if it's not macOS.
    if (process.platform !== 'darwin') {
      app.quit(); // Terminate the application.
    }
  }
);


/*
 * This block handles the application's 'finish-launching' event.
 * This event is emitted when the app has finished basic startup.
 * It's a good place to create initial windows.
 */

app.on(
  'finish-launching',
  function () {
    // Create the browser window with specified options.
    win = new BrowserWindow({
      // Set the window icon.
      icon: './media/icon.png'
    });

    // Set the initial dimensions of the window.
    win.setSize(
      475,
      400
    );

    // Center the window on the screen.
    win.center();

    // Set the window title, including the application version.
    win.setTitle(
      'Imagemin ' + app.getVersion()
    );

    // Load the main HTML file into the window.
    // The 'file://' protocol is used for local files.
    win.loadUrl(
      'file://' + __dirname + '/index.html'
    );

    // Event handler for when the window is closed.
    // Dereference the window object to allow for garbage collection.
    win.on(
      'closed',
      function () {
        win = null; // Clear the global reference.
      }
    );
  }
);