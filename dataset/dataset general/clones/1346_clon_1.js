/*
 * This file contains the main entry point for the jott application.
 * It initializes various modules and exports core functionalities.
 * Version: 1.0.0
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

( function ( ) { /* Start of the Immediately Invoked Function Expression (IIFE) */

    // Declare all necessary variables at the top of the scope
    var   entities   ,   exec   ,   fs   ,   jottOptions   ,   log   ,   moment   ,   path   ,   projectDir   ,   prompt   ;

    // --- Module Imports ---

    // Import the 'path' module for path manipulation
    path     =     require ( 'path' )     ;

    // Import 'fs-extra' for extended file system operations
    fs     =     require ( 'fs-extra' )     ;

    // Import 'child_process' for executing shell commands, specifically the 'exec' function
    exec     =     require ( 'child_process' ) . exec     ;

    // Import 'cli-prompt' for command-line user input
    prompt     =     require ( 'cli-prompt' )     ;

    // Import 'moment' for date and time formatting
    moment     =     require ( 'moment' )     ;

    // Import 'entities' for HTML entity encoding/decoding
    entities     =     require ( 'entities' )     ;

    /*
     * Global Configuration
     */

    // Set the process title for better identification in system monitors
    process . title     =     'jott'     ;

    // Determine the absolute path of the current project directory
    // This assumes the script is run from the project root.
    projectDir     =     path . resolve ( process . cwd ( ) ,   './' )     ;

    // Initialize an empty object for jott-specific options, to be populated later
    jottOptions     =     { }     ;

    // Assign console.log to a shorter variable for convenience
    log     =     console . log     ;

    // --- Module Exports ---

    /*
     * Define the public interface of this module.
     * These functions correspond to different jott commands.
     */
    module . exports     =     {

        // Function to create a new blog post
        post     :     function ( ) {
            // Delegates to an internal function responsible for blog post creation logic
            return   createBlogPost ( )     ;
        }     ,   // End of 'post' method

        // Function to initialize a new jott project
        init     :     function ( ) {
            // Delegates to an internal function handling project initialization
            return   createProject ( )     ;
        }     ,   // End of 'init' method

        // Function to build/compile the source files
        build     :     function ( ) {
            // Delegates to an internal function for compiling project sources
            return   compileSource ( )     ;
        }     ,   // End of 'build' method

        // Function to add Google Analytics tracking code
        ga     :     function ( ) {
            // Delegates to an internal function that handles Google Analytics integration
            return   addGoogleAnalytics ( )     ;
        }     // End of 'ga' method

    }     ;   // End of module.exports object

} ) . call ( this )     ;   // Execute the IIFE with 'this' context set to the global object (in browser) or undefined (in strict mode Node.js)