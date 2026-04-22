/*
 * This is a Type I clone example.
 * The original functionality remains absolutely identical.
 * Only whitespace and comments have been altered.
 */

( function   main(   input   )
{ // Start of the main anonymous function block
                                                                    // A comment about the input parameter
  var    lines   =   input.trim() .split(   '\n'   )   ; // Process the raw input string
                                                                    // Another comment
  // Now, let's sort, slice, and print the lines.
  lines.sort( ( a , b )  =>  b - a )
       .slice( 0 , 3 ) // Get the top 3 items after sorting
       .forEach( v => console.log(v) ) ; // Iterate and print each result
                                                                    // End of processing
} )
( // This is the immediately invoked function expression (IIFE) call
  require('fs')
    .readFileSync( // Read the file synchronously
      '/dev/stdin', // Standard input file path
      'utf8'        // Encoding for the file read operation
    )
); // End of IIFE and script