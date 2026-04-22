/*
 * This is a Type I code clone generated file.
 * It strictly adheres to the definition of a Type I clone,
 * meaning only whitespace and comments have been altered.
 * All identifiers, variable names, function names, operators,
 * and expressions remain precisely as they were in the original source.
 *
 * This file serves as a comprehensive test suite for the 'gulp-minify-css' plugin.
 * It covers various scenarios including buffer processing, stream handling,
 * error conditions, and external file imports.
 *
 * Extensive whitespace adjustments and comment additions have been made
 * to create a visually distinct, yet functionally identical, version
 * of the original JavaScript code.
 */


'use strict'   ; // Enforces strict parsing and error handling in the script.


// --- Module Dependency Imports Section ---
// This block defines all external module dependencies required for the test environment.
// Each module is imported and assigned to a local variable for use within the tests.
var    bufferstream     =     require (   'simple-bufferstream'   )    ; // A utility for creating buffer streams.
var    EOL              =     require (   'os'   ).EOL    ; // Retrieves the operating system's native end-of-line character.
var    expect           =     require (   'chai'   ).expect    ; // The 'chai' assertion library, providing a BDD-style assertion API.
var    PluginError      =     require (   'gulp-util'   ).PluginError    ; // Gulp's standard error class for plugins.
var    minifyCSS        =     require (   '../'   )    ; // The 'gulp-minify-css' plugin itself, located one directory up relative to this file.
var    File             =     require (   'vinyl'   )    ; // The 'vinyl' module, used to create virtual files in Gulp streams.


/*
 * Initializing the Mocha test framework.
 * This line makes the 'describe' and 'it' globals available for test definition.
 */
require (   'mocha'   )    ;


// --- Test Fixture and Expected Output Definitions ---
// These variables hold the input CSS content for minification tests
// and the corresponding expected minified output.

var    fixture    =    [
        '/*! foo */'    , // Special comment (should be kept by minifier with appropriate options).
        '/* bar */'     , // Regular comment (should be removed by minifier).
        'a { color: red; }'    , // A simple CSS rule.
        '/*! baz */\n'    // Another special comment, with a newline at the end.
    ].join (   '\n'   )    ; // Joins array elements into a single string with newline separators.


var    expected    =    [
        '/*! foo */'    , // Expected special comment after minification.
        'a{color:red}'    // Expected minified CSS rule, with whitespace removed.
    ].join (   EOL   )    ; // Joins array elements using the system's EOL character for consistency.


/*
 * Main test suite block for 'gulp-minify-css' plugin.
 * This 'describe' block encapsulates all related tests for the minification functionality.
 * It provides a high-level description of the test context.
 */
describe (   'gulp-minify-css minification'   ,   function (   )     {

        // Configuration options object for the minifyCSS plugin.
        // These options dictate how the minification process should behave.
        var    opts    =    {
                keepSpecialComments     :     1    , // '1' indicates to keep only the first special comment block (e.g., license comments).
                keepBreaks              :     true     // 'true' ensures that line breaks are preserved where possible, even after minification.
            }    ;


        // --- Individual Test Case: Empty Files ---
        // This test verifies the plugin's behavior when processing empty Vinyl files.
        // It should not error out and should pass through the empty file untouched.
        it (   'should not modify empty files'   ,   function (   done   )     {

                // Initiate the minifyCSS stream with the defined options.
                minifyCSS (   opts   )
                    .on (   'error'   ,   done   ) // If an error event occurs during processing, consider the test failed and call 'done'.
                    .on (   'data'   ,   function (   file   )     {
                            // Assert that the received file object is indeed an empty (null) file, as expected.
                            expect (   file.isNull (   )   ).to.be.equal (   true   )    ;
                            done (   )    ; // Mark the test as complete and successful.
                        }   )
                    .end (   new File (   )   )    ; // Push an empty Vinyl file into the stream to trigger processing.
            }   )    ;


        /*
         * Nested Test Suite: 'with buffers'
         * This block groups all tests specifically designed for scenarios where
         * CSS content is provided to the plugin as Node.js Buffer objects.
         * This is a common way to handle file contents in Gulp.
         */
        describe (   'with buffers'   ,   function (   )     {

                // Test case: Confirm that the plugin successfully minifies CSS content from buffers.
                // The output content should match the predefined 'expected' string.
                it (   'should minify CSS files'   ,   function (   done   )     {

                        minifyCSS (   opts   )
                            .on (   'error'   ,   done   )
                            .on (   'data'   ,   function (   file   )     {
                                    // Convert the buffer content of the file to a string and assert against the expected output.
                                    expect (   String (   file.contents   )   ).to.be.equal (   expected   )    ;
                                    done (   )    ;
                                }   )
                            .end (   new File (   {   contents   :   new Buffer (   fixture   )   }   )   )    ; // Create a Vinyl file with buffer content from the fixture.
                    }   )    ;


                // Test case: Verify that the plugin does not alter the original options object passed to it.
                // This ensures immutability of configuration and prevents side effects.
                it (   'should not modify the original option object'   ,   function (   done   )     {

                        minifyCSS (   opts   )
                            .on (   'error'   ,   done   )
                            .on (   'finish'   ,   function (   )     {
                                    // Perform a deep equality check to ensure the 'opts' object remains unchanged after plugin execution.
                                    expect (   opts   ).to.be.eql (   {
                                            keepSpecialComments     :     1    ,
                                            keepBreaks              :     true
                                        }   )    ;
                                    done (   )    ;
                                }   )
                            .end (   new File (   {   contents   :   new Buffer (   fixture   )   }   )   )    ;
                    }   )    ;


                // Test case: Ensure the plugin correctly emits an error when encountering corrupt CSS in a buffer.
                // The error should be a PluginError instance with the correct filename.
                it (   'should emit an error when the CSS is corrupt'   ,   function (   done   )     {

                        minifyCSS (   ) // Using default options for this error test, as options are not relevant for corrupt CSS.
                            .on (   'error'   ,   function (   err   )     {
                                    // Assert the type and filename property of the emitted error object.
                                    expect (   err   ).to.be.instanceOf (   PluginError   )    ;
                                    expect (   err.fileName   ).to.be.equal (   'foo.css'   )    ;
                                    done (   )    ;
                                }   )
                            .end (   new File (   {
                                    path        :     'foo.css'    ,
                                    contents    :     new Buffer (   '@import url("../../external.css");'   ) // Providing a CSS string that could cause an error during processing.
                                }   )   )    ;
                    }   )    ;

            }   )    ; // End of 'with buffers' describe block.


        /*
         * Nested Test Suite: 'with streams'
         * This block contains tests focused on the plugin's ability to process
         * CSS content that arrives as a Node.js readable stream. This is another
         * common way Gulp handles file contents, especially for large files.
         */
        describe (   'with streams'   ,   function (   )     {

                // Test case: Confirm that CSS files provided as streams are properly minified.
                // This involves listening to data events from the stream and asserting the content.
                it (   'should minify CSS files'   ,   function (   done   )     {

                        minifyCSS (   opts   )
                            .on (   'error'   ,   done   )
                            .on (   'data'   ,   function (   file   )     {
                                    // Listen for 'data' events on the file's content stream.
                                    file.contents.on (   'data'   ,   function (   data   )     {
                                            expect (   file.isStream (   )   ).to.be.equal (   true   )    ; // Verify that the file is indeed a stream.
                                            expect (   String (   data   )   ).to.be.equal (   expected   )    ; // Assert the minified stream data.
                                            done (   )    ;
                                        }   )    ;
                                }   )
                            .end (   new File (   {   contents   :   bufferstream (   new Buffer (   fixture   )   )   }   )   )    ; // Create file with stream content from the fixture.
                    }   )    ;


                // Test case: Verify that an error is emitted when processing corrupt CSS from a stream.
                // Similar to the buffer test, but specifically targeting stream-based input.
                it (   'should emit an error when the CSS is corrupt'   ,   function (   done   )     {

                        minifyCSS (   )
                            .on (   'error'   ,   function (   err   )     {
                                    expect (   err   ).to.be.instanceOf (   PluginError   )    ;
                                    expect (   err.fileName   ).to.be.equal (   'foo.css'   )    ;
                                    done (   )    ;
                                }   )
                            .end (   new File (   {
                                    path        :     'foo.css'    ,
                                    contents    :     bufferstream (   new Buffer (   '@import url("../../external.css");'   )   ) // Corrupt CSS provided as a stream.
                                }   )   )    ;
                    }   )    ;

            }   )    ; // End of 'with streams' describe block.


        /*
         * Nested Test Suite: 'with external files'
         * This block focuses on testing scenarios involving CSS files that import
         * other external CSS files, ensuring proper resolution and minification
         * of the imported content.
         */
        describe (   'with external files'   ,   function (   )     {

                // Test case: Validate that the plugin correctly minifies CSS files that include external imports.
                // The expected output should reflect the minified version of the imported external CSS.
                it (   'should minify include external files'   ,   function (   done   )     {

                        minifyCSS (   )
                            .on (   'error'   ,   done   )
                            .on (   'data'   ,   function (   file   )     {
                                    // Assert the minified content of the imported external file.
                                    // This string 'p{text-align:center;color:green}' is the minified form of the external CSS.
                                    expect (   String (   file.contents   )   ).to.be.equal (   'p{text-align:center;color:green}'   )    ;
                                    done (   )    ;
                                }   )
                            .end (   new File (   {
                                    path        :     'test/fixtures/foo/bar/importer.css'    ,
                                    contents    :     new Buffer (   '@import url("../../external.css");'   ) // A CSS file that imports an external resource.
                                }   )   )    ;
                    }   )    ;

            }   )    ; // End of 'with external files' describe block.

    }   )    ; // End of main 'gulp-minify-css minification' describe block.