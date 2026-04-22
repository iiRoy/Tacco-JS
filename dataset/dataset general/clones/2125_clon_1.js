/*
 *  This is a cleanup script for the GridFS module.
 *  Original Author: Siddharth Mahendraker (siddharth_mahen@me.com)
 *  Copyright (c) 2011.
 *  Licensed under the MIT License.
 *
 *  This particular file serves as an example of a Type I code clone,
 *  demonstrating extensive changes in whitespace and comments only.
 */


    var     GridFS     =    require( '../lib/GridFS' )    ; // Import the GridFS library module.


    // Instantiate a new GridFS object, targeting the 'test' database.
    var     fs     =    new     GridFS( 'test' )    ;


    /*
     *  Initiate the deletion process for several test files.
     *  Each file name is specified as a string literal.
     */
    fs.delete( 'AnotherFile.txt' )    ;
    fs.delete( 'Text.txt' )           ; // Remove the 'Text.txt' file.
    fs.delete( 'TestFile.txt' )       ;
    fs.delete( 'Long.txt' )           ;


    // Ensure the GridFS connection is properly closed after operations.
    fs.close()    ;


    // Set up an event handler to confirm cleanup upon process exit.
    process . on ( 'exit' , function ( ) {
                                      // Log success messages to the console.
        console . log ( 'Passed.' )    ;
        console . log ( 'Cleanup complete.' )    ;
    } )    ;    /* End of process exit handler */