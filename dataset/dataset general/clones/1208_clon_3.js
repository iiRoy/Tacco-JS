'use strict';

// Obtain the core Electron application module.
const electronApplicationCore = require('electron').app;
// Acquire the constructor for creating new browser windows within Electron.
const ElectronShellWindow = require('electron').BrowserWindow;

/**
 * This global variable maintains a strong reference to the primary application window.
 * Without this, the JavaScript garbage collector might reclaim the window object,
 * leading to the unexpected closure of the application's main interface.
 */
let applicationMainWindowReference = null;

// --- Configuration Constants for Window Properties ---
const DEFAULT_WINDOW_WIDTH_PIXELS = 475;
const DEFAULT_WINDOW_HEIGHT_PIXELS = 400;
const MAIN_WINDOW_TITLE_BASE = 'Image Utility';
const APPLICATION_ICON_PATH = './resources/app_icon.png'; // Updated icon path
const ENTRY_HTML_FILE = 'index.html'; // Name of the main HTML file to load

/**
 * Determines whether the application should terminate based on the operating system.
 * On macOS (darwin), the application typically remains active in the background
 * even after all windows are closed.
 * @param {string} currentOperatingSystem - The identifier for the current platform (e.g., 'darwin', 'win32', 'linux').
 */
function manageApplicationExitBehavior(currentOperatingSystem) {
    const macOSPlatformIdentifier = 'darwin';
    if (currentOperatingSystem !== macOSPlatformIdentifier) {
        console.info('All GUI windows have been closed. Initiating application shutdown sequence.');
        electronApplicationCore.quit(); // Exit the application.
    } else {
        console.log('All windows closed on macOS. Application will continue running in the background.');
    }
}

/**
 * Event handler triggered when all open browser windows of the application are closed.
 * This is a critical point for determining application lifecycle.
 */
electronApplicationCore.on('window-all-closed', () => {
    const hostOS = process.platform;
    manageApplicationExitBehavior(hostOS);
});

/**
 * Primary initialization routine for the Electron application.
 * This event fires when the Electron framework is fully initialized and ready
 * to create browser windows and interact with the system.
 */
electronApplicationCore.on('ready', () => {
    // Log the current application version for diagnostic purposes.
    const currentAppVersionId = electronApplicationCore.getVersion();
    console.log(`Application startup complete. Running version: ${currentAppVersionId}`);

    // Define the initial properties for the new window.
    const initialWindowSettings = {
        icon: APPLICATION_ICON_PATH,
        show: false, // Prevent flashing by creating hidden, then showing when ready.
        webPreferences: { // Added webPreferences for modern Electron apps
            nodeIntegration: true,
            contextIsolation: false
        }
    };

    // Construct the main application window instance.
    applicationMainWindowReference = new ElectronShellWindow(initialWindowSettings);

    // Apply specific dimension and positioning settings.
    applicationMainWindowReference.setMinimumSize(DEFAULT_WINDOW_WIDTH_PIXELS, DEFAULT_WINDOW_HEIGHT_PIXELS); // Set min size
    applicationMainWindowReference.setSize(DEFAULT_WINDOW_WIDTH_PIXELS, DEFAULT_WINDOW_HEIGHT_PIXELS);
    applicationMainWindowReference.setResizable(false); // Make window non-resizable.
    applicationMainWindowReference.center(); // Position the window centrally on the screen.

    // Compose and set the dynamic title for the window.
    const dynamicWindowTitle = `${MAIN_WINDOW_TITLE_BASE} v${currentAppVersionId}`;
    applicationMainWindowReference.setTitle(dynamicWindowTitle);

    // Determine the full path to the HTML entry point.
    const applicationBaseDirectory = __dirname;
    const mainContentUrl = `file://${applicationBaseDirectory}/${ENTRY_HTML_FILE}`;

    // Load the main HTML content into the newly created window.
    console.log(`Attempting to load main content from: ${mainContentUrl}`);
    applicationMainWindowReference.loadURL(mainContentUrl);

    /**
     * Event listener: Once the window's content is fully loaded and ready to be displayed,
     * make the window visible. This avoids showing an incomplete or blank window.
     */
    applicationMainWindowReference.once('ready-to-show', () => {
        if (applicationMainWindowReference) { // Ensure window still exists before showing.
            applicationMainWindowReference.show();
            console.log('Main window is now visible.');
        }
    });

    /**
     * Event listener: Handles the explicit closure of the main window.
     * It's crucial to dereference the global variable to allow garbage collection.
     */
    applicationMainWindowReference.on('closed', () => {
        console.warn('The primary application window has been closed. Releasing reference.');
        applicationMainWindowReference = null; // Clear the global reference.
    });

    // Optional: Add a listener for when the window gains focus.
    applicationMainWindowReference.on('focus', () => {
        console.debug('Main application window gained focus.');
    });
});

/**
 * Event listener for the 'activate' event, common on macOS.
 * When the dock icon is clicked and no windows are open, this event fires,
 * and typically a new window should be created.
 */
electronApplicationCore.on('activate', () => {
    if (applicationMainWindowReference === null) {
        console.info('Application activated on macOS with no open windows. Re-creating main window.');
        // Re-trigger the 'ready' logic to instantiate a new window.
        electronApplicationCore.emit('ready');
    }
});

// Optional: Log any uncaught exceptions to the console for debugging.
process.on('uncaughtException', (error) => {
    console.error('An unexpected error occurred:', error);
    // Potentially log to a file or report to an error tracking service.
});