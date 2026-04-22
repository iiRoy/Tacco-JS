/*
 * This file is responsible for running tests.
 * It dynamically loads test files from the 'tests' directory.
 */

  var   assert  =  require ( "assert" ) ; // Import the Node.js 'assert' module.

  var   fs      =  require ( "fs" ) ;     // Import the Node.js 'fs' (file system) module.


// Read all files synchronously from the 'tests' directory.
  var   testFiles   =   fs . readdirSync ( "tests" ) ;


/**
 * Defines a test suite for a given file path.
 * @param {string} path - The path to the test file.
 */
function   test ( path )
{
    // Describe the test suite using the file path.
    describe ( path ,   function ( )
    {
        // Define an individual test case.
        it ( 'should pass' ,   function ( )
        {
            // Dynamically require and execute the test file.
            require ( "./tests/" + path ) ;
        } ) ;
    } ) ;
}


// Loop through each file found in the 'tests' directory.
for   ( var   i   =   0 ;   i   <   testFiles . length ;   i ++ )
{

    // Get the current filename.
    var   filename   =   testFiles [ i ] ;

    // Check if the file is a JavaScript file.
    if   ( filename . indexOf ( ".js" )   <   0 )
    {
        // If not a JS file, skip to the next iteration.
        continue ;
    }

    // Execute the test function for the current JavaScript file.
    test ( filename ) ;
}