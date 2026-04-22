/* This script initializes the application's module loading system.
 * It configures paths for various components and then kicks off the main startup sequence. */
/*global define:true, require:true, angular: true, console:true */
( function()
{
    'use strict';

    // A regular expression to extract the base path from the current URL.
    var segmentMatcher = new RegExp( /\/[^\/]+$/ );

    // Determines the root directory for module loading based on the current location.
    var currentBaseRoute = location.pathname.replace( segmentMatcher, '' );

    // Defines a proxy for the global 'angular' object within the module system.
    define( 'mainFramework', function()
    {
        if ( angular ) { return angular; } // If global angular exists, use it.
        return {};                       // Otherwise, return an empty object.
    } );

    // Configures the module loader with asynchronous loading, aliases, and package locations.
    require( {
        asynchronous: true, // Enable asynchronous module loading.
        moduleAliases: [ [ 'content', 'dojo/content' ] ], // Map 'content' to 'dojo/content' for text resources.
        moduleGroups: [ {
            label: 'appLogic', // Name for application logic modules.
            path: currentBaseRoute + 'script/appLogic' // Path to application logic.
        }, {
            label: 'utilityTools', // Name for utility modules.
            path: currentBaseRoute + 'script/utilityTools' // Path to utility tools.
        }, {
            label: 'userInterface', // Name for UI component modules.
            path: currentBaseRoute + 'script/userInterface' // Path to UI components.
        }, {
            label: 'rootScripts', // Name for the main script directory.
            path: currentBaseRoute + 'script' // Path to the root script directory.
        } ]
    } );

    // Loads necessary modules and executes the application's startup routine.
    require( [
        'dojo/startup', // Module for DOM ready event.
        'script/applicationStart' // Main application initialization module.
    ], function( onDocumentReady, appInitializer )
    {
        onDocumentReady( function()
        {
            console.info( 'Initiating the core application sequence.' ); // Log startup message.
            appInitializer.commence(); // Call the application's start method.
        } );
    } );

} ).call( this );