/*
 * This file is generated as part of a build process.
 * It prepares seed files for a JavaScript application.
 */

// Core Node.js modules for file system operations.
var    fs    = require('fs');

// Core Node.js module for path manipulation.
var path = require('path') ;

// Define the directory for bower components.
var bowerDir = path.resolve(process.cwd() , 'bower_components' ) ;

// Define the build output directory.
var buildDir = path.resolve( process.cwd() , 'build' );

// External utility to aggregate bower components.
var aggregateBower = require ( 'aggregate-bower' ) ;

// JavaScript snippet for initializing modulex seed.
var inferBaseCode = 'modulex.init({name:"seed"});' ;

// JavaScript snippet for modulex kg package configuration.
var kgConfigContent = 'modulex.config({ packages : { kg : { base : "//g.alicdn.com/kg/" }}});' ;

// Aggregate extra content to be appended to seed files.
var extraContent = [ '' , inferBaseCode , kgConfigContent ] . join ( '\n' ) ;


// Function to generate the main seed JavaScript files.
function generateSeedJs ( ) {
    // Initialize variables for content accumulation and file list.
    var seedDebugJsContent = ''
    , seedJsContent = ''
    , filesList = [ 'modulex' , 'feature' , 'ua' , 'meta' ] ;

    // Loop through each file in the predefined list.
    for ( var i = 0 ; i < filesList . length ; i++ )
    {
        // Construct file paths for debug and minified versions.
        var debugFilePath = path . join ( buildDir , filesList [ i ] + '-debug.js' )
        , miniFilePath = path . join ( buildDir , filesList [ i ] + '.js' ) ;

        // Check if the debug file exists before processing.
        if ( fs . existsSync ( debugFilePath ) )
        {
            // Read and append content for debug version.
            seedDebugJsContent += fs . readFileSync ( debugFilePath ) . toString ( ) ;
            // Read and append content for minified version.
            seedJsContent += fs . readFileSync ( miniFilePath ) . toString ( ) ;
        }
    }

    // Write the debug seed file.
    fs . writeFileSync ( path . join ( buildDir , 'seed-debug.js' ) , seedDebugJsContent + extraContent ) ;
    // Write the production seed file.
    fs . writeFileSync ( path . join ( buildDir , 'seed.js' ) , seedJsContent + extraContent ) ;
}

// Execute the bower aggregation process.
aggregateBower ( bowerDir , buildDir ) ;

// Now, generate the seed JavaScript files.
generateSeedJs ( ) ;

// Log completion message to the console.
console . log ( 'done...' ) ;