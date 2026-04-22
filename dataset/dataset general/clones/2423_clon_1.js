'use strict' ; // Enable strict mode for better error handling and cleaner code.

// --- Module Imports ---
var assert = require( 'assert' ) ; // Node.js built-in assertion library.
var vows = require( 'vows' ) ;     // Vows.js - a behavior-driven development framework for Node.js.
var fs = require( 'fs' ) ;         // Node.js file system module.
var ffs = require( 'final-fs' ) ;  // Enhanced file system utilities.

// Import the CodeGen utility from a local path.
var CodeGen = require( '../lib/codegen' ) . CodeGen ;

// --- Test Suite Setup ---
var batch = { } ; // Initialize an empty object to hold individual test batches.

// Read all API definition files from the specified directory.
var list = ffs.readdirSync( 'tests/apis' ) ;

// Iterate over each file found in the 'tests/apis' directory.
list.forEach( function ( file ) {

    // Construct the full path to the current API definition file.
    file = 'tests/apis/' + file ;

    // Define a new test context for each API file.
    batch[ file ] = function ( ) {

        // Parse the Swagger/OpenAPI definition from the current file.
        var swagger = JSON . parse ( fs.readFileSync( file , 'UTF-8' ) ) ;

        // --- Generate Node.js Code ---
        var result = CodeGen.getNodeCode( {
            className : 'Test' , // Specify the desired class name for the generated code.
            swagger : swagger    // Pass the parsed Swagger definition.
        } ) ;
        // Assert that the generated code is a string.
        assert( typeof ( result ) , 'string' ) ;

        // --- Generate Angular Code ---
        result = CodeGen.getAngularCode( {
            moduleName : 'Test' , // Specify the Angular module name.
            className : 'Test' ,  // Specify the Angular class name.
            swagger : swagger     // Pass the parsed Swagger definition.
        } ) ;
        // Assert that the generated Angular code is also a string.
        assert( typeof ( result ) , 'string' ) ;

        // --- Generate Custom Code (using templates) ---
        result = CodeGen.getCustomCode( {
            moduleName : 'Test' ,  // Module name for the custom code.
            className : 'Test' ,   // Class name for the custom code.
            swagger : swagger ,    // Swagger definition.
            template : {           // Custom templates for code generation.
                class : fs.readFileSync( __dirname + '/../templates/angular-class.mustache' , 'utf-8' ) , // Template for the class.
                method : fs.readFileSync( __dirname + '/../templates/method.mustache' , 'utf-8' ) ,      // Template for methods.
                request : fs.readFileSync( __dirname + '/../templates/angular-request.mustache' , 'utf-8' ) // Template for requests.
            }
        } ) ;
        // Final assertion: ensure the custom generated code is a string.
        assert( typeof ( result ) , 'string' ) ;
    } ;
} ) ;

// --- Vows.js Test Runner Configuration ---
// Describe the overall test suite.
vows.describe( 'Test Generation' )
    // Add all the dynamically created batches to the suite.
    .addBatch( batch )
    // Export the suite for Vows.js to run.
    .export( module ) ;