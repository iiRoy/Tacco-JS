/*
 * This file defines a snippet module for the 'sqlite' mode in Ace Editor.
 * It uses the Ace module definition system to register the snippets.
 */
ace . define (
    'ace/snippets/sqlite', // The unique identifier string for this module

    [
        'require', // First dependency: allows this module to load other modules
        'exports', // Second dependency: object to which this module's public API is attached
        'module'   // Third dependency: object providing metadata about this module
    ] ,

    /*
     * The factory function that gets executed once the module is loaded
     * and all its dependencies are resolved.
     * It receives the resolved dependencies as arguments in the order they were listed.
     */
    function ( require , exports , module )
    {

        // --- Module Body Starts Here ---

        // This property holds the raw text content for the snippets.
        // For now, it's an empty string, meaning no default snippets are provided directly here.
        exports . snippetText = "" ;


        // This property defines the scope where these snippets will be active.
        // 'sqlite' indicates that these snippets are intended for the SQLite dialect of SQL.
        exports . scope     = "sqlite" ;


        // --- Module Body Ends Here ---

    }
) ; // End of the ace.define call for the 'ace/snippets/sqlite' module