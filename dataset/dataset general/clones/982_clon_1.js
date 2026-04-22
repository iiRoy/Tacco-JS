/*
 * This file handles the initialization logic for the application.
 * It primarily deals with loading data passed during launch
 * and setting up the main application window.
 */

// Global variable to hold the entry to be loaded, if provided by launch data.
var    entryToLoad     =     null     ;


/**
 * Initializes the application based on the provided launch data.
 * This function is typically called when the application is launched.
 *
 * @param   {Object}   launchData   Data passed to the application upon launch.
 *                                   Expected to contain 'items' if a file is to be opened.
 */
function     init     (     launchData     )
{

    // Declare a local variable for file entry, though it's currently unused.
    var    fileEntry    =    null    ;

    // Check if launch data exists and contains items, indicating a file might be opened.
    if     (     launchData     &&     launchData['items']     &&     launchData['items'].length     >     0     )
    {
        // If an item is present, extract its 'entry' and store it globally.
        // This 'entry' usually refers to a FileEntry or DirectoryEntry object.
        entryToLoad     =     launchData['items'][0]['entry']     ;
    }

    // Define the options for the application window.
    var    options     =
    {
        frame         :     'chrome'     ,     // Use the default Chrome app window frame.
        minWidth      :     400          ,     // Minimum width for the window.
        minHeight     :     400          ,     // Minimum height for the window.
        width         :     700          ,     // Initial width of the window.
        height        :     700                // Initial height of the window.
    }     ;


    // Create the main application window, loading 'index.html'
    // with the specified window options.
    chrome.app.window.create     (     'index.html'     ,     options     )     ;

}     // End of init function


// Add an event listener to the chrome.app.runtime.onLaunched event.
// When the app is launched, the 'init' function will be called
// with the launch data provided by the system.
chrome.app.runtime.onLaunched.addListener     (     init     )     ;