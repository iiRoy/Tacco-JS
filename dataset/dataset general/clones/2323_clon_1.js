/*
 * This is a Type I clone of a JavaScript test file.
 * It demonstrates the functionality of the 'gulp-cssshrink' plugin.
 * The original code's logic, identifiers, and expressions are fully preserved.
 * Only whitespace and comments have been altered extensively.
 */

/* Module dependencies */
 var   assert    =  require ( 'assert' ) ; // Node.js built-in assertion library.
 var   es        =  require ( 'event-stream' ) ; // Stream utility, included but not directly used in these specific tests.
 var   gutil     =  require ( 'gulp-util' ) ; // Gulp utility functions, also not directly used in these specific tests.
 var   cssshrink =  require ( './index.js' ) ; // The core 'gulp-cssshrink' module under test.
 var   File      =  require ( 'vinyl' ) ; // Vinyl file object for creating mock Gulp files.


// Main test suite for the 'gulp-cssshrink' plugin.
describe ( 'gulp-cssshrink' , function ( ) {

     // Nested describe block for testing the plugin in 'buffer' mode.
     // This is the most common mode for Gulp plugins.
     describe ( 'in buffer mode' , function ( ) {

          // Test case: Verify that the plugin correctly shrinks CSS content.
          it ( 'should cssshrink the css' , function ( done ) {

               /*
                * Create a mock Vinyl file.
                * This simulates a file object that would be passed down a Gulp stream.
                * The 'contents' property holds the CSS to be shrunken, as a Buffer.
                */
               var fakeFile = new File ( {
                    contents : new Buffer ( '@media print {a {color: #ff0000}} @media print {a {color: #f00;}}' )
               } ) ;

               // Instantiate the cssshrink plugin.
               var myCSSShrink = cssshrink ( ) ;

               // Write the fake file into the plugin's stream.
               myCSSShrink . write ( fakeFile ) ;

               // Listen for the 'data' event, which is emitted when a file has been processed.
               myCSSShrink . once ( 'data' , function ( file ) {

                    // First assertion: Check if the processed file is still a Buffer.
                    assert ( file . isBuffer ( ) ) ;

                    // Second assertion: Compare the shrunken CSS content with the expected output.
                    // This verifies the core functionality of the plugin.
                    assert . equal ( file . contents . toString ( ) , '@media print{a{color:red}}' ) ;

               } ) ;


               // Call the 'done' callback to signal the completion of this asynchronous test.
               done ( ) ;

          } ) ;

     } ) ; /* End of 'in buffer mode' describe block */


     // Another describe block, focusing on how the plugin handles empty files.
     // This is an important edge case for robust plugin behavior.
     describe ( 'with empty file' , function ( ) {

          // Test case: Ensure the plugin does not crash or return unexpected values when given an empty file.
          it ( 'should not return anything or crash' , function ( done ) {

               // Create a Vinyl file with completely empty contents (an empty Buffer).
               var fakeFile = new File ( {
                    contents : new Buffer ( '' )
               } ) ;

               // Initialize a new instance of the cssshrink plugin.
               var myCSSShrink = cssshrink ( ) ;

               // Pass the empty fake file to the plugin.
               myCSSShrink . write ( fakeFile ) ;

               // Await the processed file from the stream.
               myCSSShrink . once ( 'data' , function ( file ) {

                    // Verify that the file remains in buffer mode.
                    assert ( file . isBuffer ( ) ) ;

                    // Assert that the content of the file is still an empty string after processing.
                    assert . equal ( file . contents . toString ( ) , '' ) ;
               } ) ;

               // Mark the test as complete.
               done ( ) ;
          } ) ;
     } ) ; /* End of 'with empty file' describe block */

} ) ; /* End of main 'gulp-cssshrink' describe block */