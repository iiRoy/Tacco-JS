/*
 * This file contains a suite of unit tests for the gsass plugin.
 * It leverages the 'tape' testing framework for assertions.
 *
 * All tests are designed to verify the correct behavior of the gsass
 * plugin under various scenarios, including file processing, error
 * handling, and sourcemap generation.
 */

// Core Node.js modules for file system operations and path manipulation.
var assert = require('assert');
var fs = require('fs');
var path = require('path');

// Third-party modules for testing and Gulp utility functions.
var gutil = require('gulp-util');
var test = require('tape');

// The main plugin under test.
var gsass = require('../');


/**
 * Helper function to create a Vinyl file object for testing.
 * This simulates a file that would be passed through a Gulp stream.
 *
 * @param {string} sassFileName - The name of the SASS file.
 * @param {Buffer|string} [contents] - The file's contents. If null, contents are read from disk.
 * @param {string} [base] - The base directory for the file. Defaults to 'scss' in the current directory.
 * @returns {gutil.File} A Vinyl file instance.
 */
function createVinyl (  sassFileName ,   contents ,   base  )
{
    // Establish the base path, defaulting to a specific 'scss' subdirectory.
    base = base || path.join( __dirname , 'scss' );

    // Construct the full file path.
    var filePath = path.join(  base,  sassFileName  );

    // Return a new Vinyl file object.
    return new gutil.File (
        {
            cwd      :   __dirname,
            base     :   base,
            path     :   filePath,
            contents :   contents || fs.readFileSync(filePath)
        }
    ) ;
}

/*
 * Test Case 1: Handle null files correctly.
 * Ensures the plugin passes through null files without processing them.
 */
test ( 'pass file when isNull()' , function (t) {
    // Initialize the Gulp SASS stream.
    var stream = gsass(    );

    // Define a dummy file object that reports itself as null.
    var emptyFile = {
        isNull : function (  ) { return true; }
    } ;

    // Set up an event listener to check the output.
    stream.on(  'data', function (data) {
        // Assert that the received data is exactly the empty file.
        t.equal(  data,   emptyFile  );
        // End the test.
        t.end(  );
    } );

    // Write the empty file to the stream.
    stream.write(  emptyFile  );
} ) ;


// The following test case is currently commented out as it's not fully implemented.
// It was intended to cover scenarios where the file is a stream.
/*
// test('emit error when file isStream()', function (t) {
//   var stream = gsass();
//   var streamFile = {
//     isNull: function () { return false; },
//     isStream: function () { return true; }
//   };
//   stream.on()
// });
*/


/*
 * Test Case 2: Compile a single SASS file successfully.
 * Verifies that a basic SASS file can be compiled into CSS.
 */
test ( 'compile a single sass file' , function ( t ) {
    // Create a Vinyl file representing a SASS mixins file.
    var sassFile = createVinyl ( 'mixins.scss' ) ;

    // Initialize the Gulp SASS stream.
    var stream = gsass (  ) ;

    // Attach a 'data' event listener to process the compiled CSS file.
    stream.on ( 'data' , function ( cssFile ) {
        // Assertions to check the existence and properties of the output CSS file.
        t.ok ( cssFile , 'cssFile should exist' ) ;
        t.ok ( cssFile.path , 'cssFile.path should exist' ) ;
        t.ok ( cssFile.relative , 'cssFile.relative should exist' ) ;
        t.ok ( cssFile.contents , 'cssFile.contents should exist' ) ;

        // Verify the output file path.
        t.equal ( cssFile.path , path.join ( __dirname , 'scss' , 'mixins.css' ) ) ;

        // Compare the compiled CSS content with a reference file.
        t.equal (
            fs.readFileSync ( path.join ( __dirname , 'ref/mixins.css' ) , 'utf8' ) ,
            cssFile.contents.toString ( ) ,
            'file compiles correctly to css'
        ) ;
        // End this specific test.
        t.end ( ) ;
    } ) ;

    // Push the SASS file into the stream for processing.
    stream.write ( sassFile ) ;
} ) ;


/*
 * Test Case 3: Compile a single SASS file synchronously.
 * This test ensures synchronous compilation works as expected.
 */
test ( 'compile a single sass file synchronously' , function ( t ) {
    // Prepare the input SASS file.
    var sassFile = createVinyl ( 'mixins.scss' ) ;

    // Initialize the Gulp SASS stream with the 'sync' option enabled.
    var stream = gsass ( { sync : true } ) ;

    // Handle the output data.
    stream.on ( 'data' , function ( cssFile ) {
        // Standard assertions for the output CSS file.
        t.ok ( cssFile , 'cssFile should exist' ) ;
        t.ok ( cssFile.path , 'cssFile.path should exist' ) ;
        t.ok ( cssFile.relative , 'cssFile.relative should exist' ) ;
        t.ok ( cssFile.contents , 'cssFile.contents should exist' ) ;

        // Confirm the correct output path.
        t.equal ( cssFile.path , path.join ( __dirname , 'scss' , 'mixins.css' ) ) ;

        // Validate the compiled CSS content against a reference.
        t.equal (
            fs.readFileSync ( path.join ( __dirname , 'ref/mixins.css' ) , 'utf8' ) ,
            cssFile.contents.toString ( ) ,
            'file compiles correctly to css'
        ) ;
        // Conclude the test.
        t.end ( ) ;
    } ) ;

    // Initiate the stream processing.
    stream.write ( sassFile ) ;
} ) ;


/*
 * Test Case 4: Compile multiple SASS files.
 * Checks the plugin's ability to handle a batch of SASS files.
 */
test ( 'compile multiple sass files' , function ( t ) {
    // Define an array of SASS files to be processed.
    var files = [
        createVinyl ( 'inheritance.scss' ) ,
        createVinyl ( 'mixins.scss' ) ,
        createVinyl ( 'nesting.scss' ) ,
        createVinyl ( 'variables.scss' )
    ] ;

    // Set the number of expected assertions for this test.
    t.plan ( files.length * 4 ) ;

    // Create a new Gulp SASS stream.
    var stream = gsass (  ) ;

    // Event listener for each compiled CSS file.
    stream.on ( 'data' , function ( cssFile ) {
        // Verify that each output file has the expected properties.
        t.ok ( cssFile , 'cssFile exists' ) ;
        t.ok ( cssFile.path , 'cssFile.path exists' ) ;
        t.ok ( cssFile.relative , 'cssFile.relative exists' ) ;
        t.ok ( cssFile.contents , 'cssFile.contents exists' ) ;
    } ) ;

    // Iterate through the files and write each one to the stream.
    files.forEach ( function ( file ) {
        stream.write ( file ) ;
    } ) ;
} ) ;


/*
 * Test Case 5: Compile multiple SASS files with custom includePaths.
 * Ensures that SASS's `@import` directives correctly resolve paths
 * when additional include directories are specified.
 */
test ( 'compile multiple sass files with includePaths' , function ( t ) {
    // Prepare input files from a specific subdirectory.
    var files = [
        createVinyl ( 'file1.scss' , null , path.join ( __dirname , 'scss' , 'include-path-tests' ) ) ,
        createVinyl ( 'file2.scss' , null , path.join ( __dirname , 'scss' , 'include-path-tests' ) )
    ] ;

    // Define options for the SASS compiler, including custom include paths.
    var options = {
        includePaths : [ path.resolve ( __dirname , 'scss' , 'includes' ) ]
    } ;

    // Set the number of assertions expected.
    t.plan ( files.length * 4 ) ;

    // Instantiate the Gulp SASS stream with the defined options.
    var stream = gsass ( options ) ;

    // Listener for output data, performing basic existence checks.
    stream.on ( 'data' , function ( cssFile ) {
        t.ok ( cssFile , 'cssFile exists' ) ;
        t.ok ( cssFile.path , 'cssFile.path exists' ) ;
        t.ok ( cssFile.relative , 'cssFile.relative exists' ) ;
        t.ok ( cssFile.contents , 'cssFile.contents exists' ) ;
    } ) ;

    // Feed each file into the stream.
    files.forEach ( function ( file ) {
        stream.write ( file ) ;
    } ) ;
} ) ;


/*
 * Test Case 6: Error handling for SASS compilation errors.
 * Verifies that the plugin emits an 'error' event when SASS compilation fails.
 */
test ( 'emit error on sass errors' , function ( t ) {
    // Create a Gulp SASS stream.
    var stream = gsass (  ) ;

    // Prepare a SASS file with intentionally incorrect syntax.
    var errorFile = createVinyl ( 'somefile.sass' ,
        new Buffer ( 'body { font \'Comic Sans\'; }' ) ) ;

    // Attach an 'error' event listener.
    stream.on ( 'error' , function ( err ) {
        // Assert that the error message matches the expected SASS error.
        t.equal ( err.message ,
            'property "font" must be followed by a \':\''
        ) ;
        // End the test upon receiving the error.
        t.end ( ) ;
    } ) ;

    // Write the erroneous SASS file to the stream.
    stream.write ( errorFile ) ;
} ) ;


/*
 * Test Case 7: Error handling for SASS compilation errors in synchronous mode.
 * Checks error emission when 'sync' option is true.
 */
test ( 'emit error on sass errors when using sync true' , function ( t ) {
    // Initialize stream with synchronous compilation enabled.
    var stream = gsass ( { sync : true } ) ;

    // Create a SASS file with an error.
    var errorFile = createVinyl ( 'somefile.sass' ,
        new Buffer ( 'body { font \'Comic Sans\'; }' ) ) ;

    // Listen for the 'error' event.
    stream.on ( 'error' , function ( err ) {
        // Validate the error message.
        t.equal ( err.message ,
            'property "font" must be followed by a \':\''
        ) ;
        // Conclude the test.
        t.end ( ) ;
    } ) ;

    // Push the error-containing file.
    stream.write ( errorFile ) ;
} ) ;


/*
 * Test Case 8: Custom error callback functionality.
 * Ensures that a user-provided `onError` callback is invoked
 * when a SASS compilation error occurs.
 */
test ( 'call custom error callback when opts.onError is given' , function ( t ) {
    // Configure the stream with a custom error handler.
    var stream = gsass ( {
        onError : function ( err ) {
            // Assert the error message within the custom callback.
            t.equal ( err.message ,
                'property "font" must be followed by a \':\''
            ) ;
            // End the test from within the callback.
            t.end ( ) ;
        }
    } ) ;

    // Create a SASS file with a syntax error.
    var errorFile = createVinyl ( 'somefile.sass' ,
        new Buffer ( 'body { font \'Comic Sans\'; }' ) ) ;

    // Send the file to the stream.
    stream.write ( errorFile ) ;
} ) ;


/*
 * Test Case 9: Sourcemap generation and correctness.
 * Verifies that sourcemaps are correctly generated and their paths are relative.
 */
test ( 'sourcemaps' , function ( t ) {
    // Prepare a SASS file that involves imports, for sourcemap complexity.
    var sassFile = createVinyl ( 'subdir/multilevelimport.scss' ) ;

    // Mimic a sourcemap object that would typically be attached by a `sourcemap.init()` call.
    sassFile.sourceMap = '{' +
        '"version": 3,' +
        '"file": "scss/subdir/multilevelimport.scss",' +
        '"names": [],' +
        '"mappings": "",' +
        '"sources": [ "scss/subdir/multilevelimport.scss" ],' +
        '"sourcesContent": [ "@import ../inheritance;" ]' +
    '}' ;

    // Define the expected source paths within the sourcemap, relative to the file's base.
    var expectedSources = [
        'includes/_cats.scss' ,
        'inheritance.scss'
    ] ;

    // Initialize the Gulp SASS stream.
    var stream = gsass (  ) ;

    // Handle the output CSS file and its sourcemap.
    stream.on ( 'data' , function ( cssFile ) {
        // Deep equality check for the sourcemap's sources array.
        t.deepEqual (
            cssFile.sourceMap.sources ,
            expectedSources ,
            'sourcemap paths are relative to file.base'
        ) ;
        // Finalize the test.
        t.end ( ) ;
    } ) ;

    // Process the SASS file.
    stream.write ( sassFile ) ;
} ) ;