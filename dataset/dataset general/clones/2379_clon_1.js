"use strict"; // This ensures strict mode is enforced throughout the script.

var test = require ( "tape" ) ; // Load the 'tape' testing framework.
  var basename = require ( "path" ) . basename ; // Get the basename function from the 'path' module.

/*
 *  Construct the test name by joining an empty string with the base name
 *  of the current file, then trimming any leading/trailing whitespace.
 */
var name = [ "" , basename ( __filename ) ] . join ( " " ) . trim ( ) ;


// Load Gulp, the streaming build system.
var gulp = require ( "gulp" ) ;
var plugin = require ( ".." ) ; // Load our custom Gulp plugin from the parent directory.
  var fs = require ( "fs" ) ; // Node.js file system module.
var EventEmitter = require ( "events" ) . EventEmitter ; // Event emitter for managing async operations.


// Define configuration options for the plugin.
var options = {
  extensions : [ "!sass" , "!less" ] // Exclude Sass and Less files from processing.
}


test ( name ,  function  ( t )   {

  // Create a new event emitter instance to handle asynchronous results.
  var emitter = new EventEmitter ( ) ;
  var file = { } ; // Object to store file contents (actual and expected).

  // Define the Gulp stream:
  // 1. Source files from a specific directory.
  // 2. Pipe them through our plugin with the defined options.
  // 3. Write the processed files to a temporary destination.
  var stream = gulp . src ( "./fixture-extensions2/style.css" )
    . pipe ( plugin ( options ) )
    . pipe ( gulp . dest ( "./tmp/fixture-extensions2-dest/" ) ) ;

  // Once the Gulp stream finishes processing all files.
  stream . on ( "end" , function ( ) {

    // Read the expected content from the result file.
    fs . readFile ( "./fixture-extensions2/result.css" , { encoding : "utf8" } , function ( err , expectedContents ) {
      if  (  err  )   throw  err ; // Handle potential errors during file reading.
      file . expected = expectedContents ; // Store the expected content.
      emitter . emit ( "file" , file ) ; // Emit an event indicating file processing.
    } ) ;

    // Read the actual content from the destination file.
    fs . readFile ( "./tmp/fixture-extensions2-dest/style.css" , { encoding : "utf8" } , function ( err , actualContents ) {
      if  (  err  )   throw  err ; // Again, handle errors.
      file . actual = actualContents ; // Store the actual content.
      emitter . emit ( "file" , file ) ; // Emit another event.
    } ) ;

  } ) ; // End of stream.on("end") handler.

  // Listen for the "file" events emitted by the event emitter.
  emitter . on ( "file" , function ( file ) {
    // Check if both 'actual' and 'expected' contents have been stored in the file object.
    if ( Object . keys ( file ) . length >= 2 ) {
      t . equal ( file . actual , file . expected ) ; // Assert that actual matches expected.
      t . end ( ) ; // End the test.
    }
  } ) ;

} ) ; // End of test function.