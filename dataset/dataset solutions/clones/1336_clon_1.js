/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity.
 * Only whitespace and comments have been altered significantly.
 * This file demonstrates extensive modifications to its appearance.
 */
'use strict'
; /* Enforces strict parsing and error handling for better code quality. */



( function (   stdin   ) {

    // Reads all lines from the standard input.
    var   lines = stdin . toString (  ) . split (  '\n'  ) ;

    /**
     * Defines the Command constructor.
     * @param {string} str - The initial text string to be manipulated.
     */
    var   Command   =   function ( str )
    {
        this . text = str;     // The current text content.
        this . buf  = [ ] ;    // Buffer to store results of 'print' operations.
    };

    /*
     * Extends the Command prototype with an 'exec' method.
     * This method executes a specific text manipulation command.
     */
    Command . prototype . exec = function (   command ,   index ,   option   )
    {
        var   self    =    this   ; // Capture 'this' for use in nested functions.

        var commands = {
            // 'print' command: Slices a portion of the text and adds it to the buffer.
            print : function ( index )
            {
                self . buf . push (   self . text . slice (   index [ 0 ] ,   index [ 1 ] + 1   )   ) ;
            } ,
            // 'reverse' command: Reverses a specified segment of the text.
            reverse : function ( index )
            {
                var chars   =   self . text . split ( '' ) ;
                var reverse = chars . slice (   index [ 0 ] ,   index [ 1 ] + 1   ) . reverse (  ) . join (  ''  ) ;
                this . replace (   index ,   reverse   ) ; // Uses the 'replace' utility.
            } ,
            // 'replace' command: Replaces a segment of the text with a new string.
            replace : function ( index , option )
            {
                var chars = self . text . split ( '' ) ;
                chars . splice (   index [ 0 ] ,   index [ 1 ] - index [ 0 ] + 1 ,   option   ) ;
                self . text = chars . join ( '' ) ; // Update the main text property.
            }
        } ;

        // Execute the appropriate command based on the 'command' argument.
        commands [ command ] ( index , option ) ;
    }

    /**
     * Overrides the default toString method for Command objects.
     * Joins all buffered output lines with newline characters.
     * @returns {string} The concatenated buffered output.
     */
    Command . prototype . toString = function ( ) {
        return this . buf . join ( '\n' ) ;
    } ;



    /*
     * Immediately Invoked Function Expression (IIFE) to process commands.
     * It extracts the initial source string and an array of commands.
     */
    var   result    =    (   function (   source ,   commands   )   {

        var   command   =   new   Command (   source   ) ; // Initialize a new Command instance.

        // Iterate over each command definition and execute it.
        commands . forEach (   function (   v   )   {
            // v[0] is the command name (e.g., 'print', 'reverse').
            // v.slice(1,3).map(Number) extracts start and end indices as numbers.
            // v[3] is the optional third argument (e.g., replacement string).
            command . exec (   v [ 0 ] ,   v . slice ( 1 , 3 ) . map ( Number ) ,   v [ 3 ]   ) ;
        }   ) ;

        return command . toString ( ) ; // Return the final processed output.

    } (   lines . shift ( ) , /* The first line is the initial text. */

          lines . slice ( 0 , lines . shift ( ) ) . map ( function ( v ) { return v . split ( ' ' ) } ) /* Subsequent lines define commands. */

        )
    ) ;

    // Output the final result to the console.
    console . log ( result ) ;

} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // Read the input file synchronously.