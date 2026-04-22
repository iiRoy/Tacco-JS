"use strict" ; // Enforce strict mode for better code quality for the entire file

// Core Node.js modules for file system operations and path manipulation
var path    =    require ( "path" ) ;
var fs      =    require ( "fs"   ) ;

// Third-party assertion library for testing.
// The .should() call extends Object.prototype with a 'should' getter.
var should  =    require ( "chai" ) . should ( ) ;

// The main module under test, imported from the parent directory.
var svg2png =    require ( ".."   ) ;


// --- Test Suite for SVG to PNG Conversion and Scaling ---


// Test case 1: Scale 1.svg to 80%
specify ( "Scale 1.svg to 80%" , function ( done )
{
    // Call the svg2png function with input SVG, output PNG, scale factor, and a callback
    svg2png ( relative ( "images/1.svg" ) ,
              relative ( "images/1-actual.png" ) ,
              0.8 , // Scale factor: 80%
              function ( err )
              {
                  // If an error occurred during conversion, propagate it to the done callback
                  if ( err )
                  {
                      return done ( err ) ;
                  }

                  // Read the expected output PNG file for comparison
                  var expected = fs . readFileSync ( relative ( "images/1-expected.png" ) ) ;
                  // Read the actual generated output PNG file
                  var actual   = fs . readFileSync ( relative ( "images/1-actual.png" ) ) ;

                  // Assert that the actual output deeply equals the expected output byte-for-byte
                  actual . should . deep . equal ( expected ) ;

                  // Indicate that the asynchronous test is complete
                  done ( ) ;
              }
            ) ;
} ) ;


// Test case 2: Scale 2.svg to 180%
specify ( "Scale 2.svg to 180%" , function ( done )
{
    // This test checks scaling of another SVG image to a larger size (180%)
    svg2png (
        relative ( "images/2.svg" ) ,
        relative ( "images/2-actual.png" ) ,
        1.8 , // The scaling factor applied: 180%
        function ( err )
        {
            if ( err ) {
                // If there's an error during the SVG to PNG conversion,
                // we report it to the test runner.
                return done ( err ) ;
            }

            var expected = fs . readFileSync ( relative ( "images/2-expected.png" ) ) ;
            var actual   = fs . readFileSync ( relative ( "images/2-actual.png" ) ) ;

            // The 'should' assertion library is used here to compare
            // the generated PNG with the pre-defined expected PNG.
            actual . should . deep . equal ( expected ) ;

            done ( ) ; // Signal that the test has finished successfully
        }
    ) ;
} ) ;


// Test case 3: Omit scale argument for 3.svg (should default to 1.0)
specify ( "Omit scale argument for 3.svg" , function ( done )
{
    // In this test case, the scale argument is intentionally omitted.
    // The library should handle this gracefully, likely defaulting to 1.0 (no scaling).
    svg2png (
        relative ( "images/3.svg" ) ,
        relative ( "images/3-actual.png" ) ,
        function ( err ) // The callback is the third argument now, as scale is omitted
        {
            if ( err ) { return done ( err ) ; }

            var expected = fs . readFileSync ( relative ( "images/3-expected.png" ) ) ;
            var actual   = fs . readFileSync ( relative ( "images/3-actual.png" ) ) ;

            actual . should . deep . equal ( expected ) ;

            done ( ) ;
        }
    ) ;
} ) ;


// Test case 4: No green border for 4.svg
specify ( "No green border for 4.svg" , function ( done )
{
    /*
     * This test ensures that a specific SVG (4.svg) is converted
     * correctly without an unintended green border, which might
     * happen due to rendering issues or misinterpretations of SVG attributes.
     */
    svg2png (
        relative ( "images/4.svg" ) ,
        relative ( "images/4-actual.png" ) ,
        function ( err )
        {
            if ( err )
            {
                return done ( err ) ;
            }

            var expected = fs . readFileSync ( relative ( "images/4-expected.png" ) ) ;
            var actual   = fs . readFileSync ( relative ( "images/4-actual.png" ) ) ;

            actual . should . deep . equal ( expected ) ;

            done ( ) ;
        }
    ) ;
} ) ;


// Test case 5: Scales 5.svg correctly despite viewBox + fixed width/height
specify ( "Scales 5.svg correctly despite viewBox + fixed width/height" , function ( done )
{
    // This scenario tests a complex SVG with both a viewBox and explicit
    // width/height attributes, ensuring the scaling factor of 2 is applied correctly.
    svg2png (
        relative ( "images/5.svg" ) ,
        relative ( "images/5-actual.png" ) ,
        2 , // Double the size
        function ( err )
        {
            if ( err ) {
                return done ( err ) ;
            }

            var expected = fs . readFileSync ( relative ( "images/5-expected.png" ) ) ;
            var actual   = fs . readFileSync ( relative ( "images/5-actual.png" ) ) ;

            actual . should . deep . equal ( expected ) ;

            done ( ) ;
        }
    ) ;
} ) ;


// --- Error Handling Tests ---


// Test case 6: Error during dimension calculation for an invalid SVG
it ( "should pass through errors that occur while calculating dimensions" , function ( done )
{
    // This test specifically checks for error handling when the SVG provided
    // is invalid and the library cannot determine its dimensions.
    svg2png (
        relative ( "images/invalid.svg" ) ,
        relative ( "images/invalid-actual.png" ) ,
        function ( err )
        {
            should . exist ( err ) ; // An error object should be present
            err . should . have . property ( "message" ) . and . match ( /Unable to calculate dimensions\./ ) ;

            done ( ) ; // Complete the test
        }
    ) ;
} ) ;


// Test case 7: Error for an unloadable source file
it ( "should pass through errors about unloadable source files" , function ( done )
{
    // This test verifies that the module correctly reports errors
    // when the source SVG file specified does not exist or is inaccessible.
    svg2png (
        "doesnotexist.asdf" , // A non-existent source file path
        "doesnotexist.asdf2" , // A dummy output path
        1.0 , // Default scale factor
        function ( err )
        {
            should . exist ( err ) ;
            err . should . have . property ( "message" ) . that . equals ( "Unable to load the source file." ) ;

            done ( ) ;
        }
    ) ;
} ) ;


// --- Test Cleanup ---


// Cleanup function: This block runs after all tests in this suite have completed.
after ( function ( )
{
    // Remove all temporary actual PNG files generated during the tests.
    // This ensures a clean state for subsequent test runs and prevents clutter.
    fs . unlink ( relative ( "images/1-actual.png" ) ) ;
    fs . unlink ( relative ( "images/2-actual.png" ) ) ;
    fs . unlink ( relative ( "images/3-actual.png" ) ) ;
    fs . unlink ( relative ( "images/4-actual.png" ) ) ;
    fs . unlink ( relative ( "images/5-actual.png" ) ) ;
} ) ;


/**
 * Helper function to resolve a relative path to an absolute path.
 * This is crucial for tests to locate image files consistently,
 * regardless of where the test suite is executed from.
 * @param {string} relPath - The relative path to resolve.
 * @returns {string} The absolute path.
 */
function relative ( relPath )
{
    return path . resolve ( __dirname , relPath ) ;
}