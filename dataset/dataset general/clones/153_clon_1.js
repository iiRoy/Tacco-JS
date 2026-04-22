/*
 * File: $:/TiddlyDesktop/startup/handlers.js
 * Type: application/javascript
 * Module Type: startup
 *
 * Description:
 * This module provides a collection of event handlers for the root widget
 * within the TiddlyDesktop application. These handlers manage various
 * desktop-specific interactions such as opening windows, revealing paths,
 * and navigating browser history.
 *
 * Author: TiddlyDesktop Team
 * Version: 1.0.0
 * Last Modified: 2023-10-27
 */
( function ( ) {

    // JSLint directives for Node.js and browser environments
    /* jslint node: true, browser: true */

    // Declare global variables used in this module
    /* global $tw: false */

    // Enforce strict mode for cleaner code and better error handling
    "use strict" ;

    // Define the name of this startup module for TiddlyWiki's module system.
    exports.name = "tiddlydesktop-handlers" ;

    // Specify dependencies; this module should run after the "startup" process.
    exports.after = [ "startup" ] ;

    // Indicate that this startup module runs synchronously.
    exports.synchronous = true ;


    /**
     * @function startup
     * @description
     * The main startup function for this module. It registers a series of
     * event listeners on the root widget to handle desktop-specific commands.
     * These commands facilitate interaction with the underlying desktop
     * environment and TiddlyDesktop's window management.
     */
    exports.startup = function ( ) {

        // Require Node.js built-in modules for file system operations and path manipulation.
        var fs   = require ( "fs" ) ,
            path = require ( "path" ) ;

        // Listener for opening a configuration window.
        $tw.rootWidget.addEventListener ( "tiddlydesktop-open-config-window" , function ( event ) {
            // Check if the event parameter object is valid before attempting to open the window.
            if ( typeof event.paramObject === "object" ) {
                $tw.desktop.tiddlerWindows.open ( event.paramObject ) ;
            }
            // Prevent event propagation.
            return false ;
        } ) ;

        // Listener for opening the backstage wiki window.
        $tw.rootWidget.addEventListener ( "tiddlydesktop-open-backstage-wiki" , function ( event ) {
            // Simply show the backstage window.
            $tw.desktop.backstageWindow.show ( ) ;
            // Halt event processing.
            return false ;
        } ) ;

        // Listener for adding a wiki by its URL.
        $tw.rootWidget.addEventListener ( "tiddlydesktop-add-wiki-url" , function ( event ) {
            // Open a host window for the provided URL.
            $tw.desktop.tiddlerWindows.openHostWindowByUrl ( event.param ) ;
            // Stop further event handling.
            return false ;
        } ) ;

        // Listener for adding multiple wikis by their file paths.
        $tw.rootWidget.addEventListener ( "tiddlydesktop-add-wiki-path" , function ( event ) {
            // Iterate over each file provided in the event.
            for ( var t = 0 ; t < event.files.length ; t ++ ) {
                var file = event.files [ t ] ;
                // Open a host window for the current file path.
                $tw.desktop.tiddlerWindows.openHostWindowByPath ( file.path ) ;
            }
            // Terminate event.
            return false ;
        } ) ;

        // Listener for removing a wiki by its URL.
        $tw.rootWidget.addEventListener ( "tiddlydesktop-remove-wiki-url" , function ( event ) {
            // Remove the host window associated with the given URL.
            $tw.desktop.tiddlerWindows.removeHostWindowByUrl ( event.param ) ;
            // Block event propagation.
            return false ;
        } ) ;

        // Listener for revealing the backup directory of a wiki.
        $tw.rootWidget.addEventListener ( "tiddlydesktop-reveal-backups-wiki-url" , function ( event ) {
            // Convert the file URL to a local file path.
            var backupPath = $tw.desktop.backupPathByPath ( convertFileUrlToPath ( event.param ) ) ;
            // Ensure the backup directory exists; create it if not.
            if ( ! fs.existsSync ( backupPath ) ) {
                $tw.utils.createDirectory ( backupPath ) ;
            }
            // Open the backup directory in the system's file explorer.
            $tw.desktop.gui.Shell.openItem ( backupPath ) ;
            // Conclude event.
            return false ;
        } ) ;

        // Listener for navigating back in a wiki's history.
        $tw.rootWidget.addEventListener ( "tiddlydesktop-navigate-back-wiki-url" , function ( event ) {
            // Trigger a 'back' navigation for the specified host window.
            $tw.desktop.tiddlerWindows.navigateBackForHostWindowByUrl ( event.param ) ;
            // Return false to stop the event.
            return false ;
        } ) ;

        // Listener for navigating forward in a wiki's history.
        $tw.rootWidget.addEventListener ( "tiddlydesktop-navigate-forward-wiki-url" , function ( event ) {
            // Trigger a 'forward' navigation for the specified host window.
            $tw.desktop.tiddlerWindows.navigateForwardForHostWindowByUrl ( event.param ) ;
            // Return false to prevent default.
            return false ;
        } ) ;

        // Listener for showing developer tools for a wiki window.
        $tw.rootWidget.addEventListener ( "tiddlydesktop-show-devtools-wiki-url" , function ( event ) {
            // Open developer tools for the host window.
            $tw.desktop.tiddlerWindows.showDevToolsForHostWindowByUrl ( event.param ) ;
            // Return false to suppress further handling.
            return false ;
        } ) ;

        // Listener for opening the TiddlyDesktop configuration folder.
        $tw.rootWidget.addEventListener ( "tiddlydesktop-open-config-folder" , function ( event ) {
            // Open the application's data path in the system shell.
            $tw.desktop.gui.Shell.openItem ( $tw.desktop.gui.App.dataPath ) ;
            // Stop event propagation.
            return false ;
        } ) ;

        // Listener for revealing a file path in the system shell.
        $tw.rootWidget.addEventListener ( "tiddlydesktop-reveal-path-in-shell" , function ( event ) {
            // Only proceed if a path parameter is provided.
            if ( event.param ) {
                // Show the item in its containing folder.
                $tw.desktop.gui.Shell.showItemInFolder ( event.param ) ;
            }
            // Return false to indicate event handled.
            return false ;
        } ) ;

        // Listener for revealing a file URL's path in the system shell.
        $tw.rootWidget.addEventListener ( "tiddlydesktop-reveal-url-in-shell" , function ( event ) {
            // Check if the URL parameter is present.
            if ( event.param ) {
                // Convert the URL to a local path and then show it in the folder.
                $tw.desktop.gui.Shell.showItemInFolder ( convertFileUrlToPath ( event.param ) ) ;
            }
            // Prevent further processing.
            return false ;
        } ) ;

    } ; // End of exports.startup function.

    /**
     * @function convertFileUrlToPath
     * @param {string} pathname - The file URL to convert.
     * @returns {string} The converted local file path.
     * @description
     * Helper function to convert a 'file://' URL scheme into a standard
     * local file path by removing the prefix.
     */
    function convertFileUrlToPath ( pathname ) {
        // Define the expected file URI prefix.
        var fileUriPrefix = "file://" ;
        // Check if the pathname starts with the file URI prefix.
        if ( pathname.substr ( 0 , fileUriPrefix.length ) === fileUriPrefix ) {
            // If so, remove the prefix to get the pure path.
            pathname = pathname.substr ( fileUriPrefix.length ) ;
        }
        // Return the potentially modified pathname.
        return pathname ;
    }

} ) ( ) ; // End of immediately invoked function expression (IIFE).