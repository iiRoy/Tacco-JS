/* This is a Type I clone of an existing JavaScript snippet.
   The core logic and identifiers remain absolutely identical.
   Only whitespace and comments have been altered significantly
   to demonstrate the cloning process as per Type I definition. */

  'use strict' ; // Enforce strict mode for better code quality.


( function ( stdin ) { // The entire script is wrapped in an Immediately Invoked Function Expression (IIFE).

  // No custom functions are declared within this scope for this particular problem.
  // Function declaration comments are retained for structural similarity.


  // Variable declarations section.
  // These variables will store and process the input data.

  var inputs = stdin . toString ( ) . trim ( ) . split ( ' ' ) ; // Read input, convert to string, remove leading/trailing whitespace, then split by space.

  var a = parseInt ( inputs [ 0 ] ) ; // Parse the first input string as an integer and assign to 'a'.
  var b = parseInt ( inputs [ 1 ] ) ; // Parse the second input string as an integer and assign to 'b'.
  var c = parseInt ( inputs [ 2 ] ) ; // Parse the third input string as an integer and assign to 'c'.


  // Main logic section begins here.
  // This block determines if the given numbers form an increasing sequence.

  if ( a < b ) // Check if 'a' is strictly less than 'b'.
  {
    if ( b < c ) // If the first condition is true, then check if 'b' is strictly less than 'c'.
    {
      console . log ( 'Yes' ) ; // If both conditions are met, print 'Yes' to standard output.
      return ; // Exit the function immediately as the condition is satisfied.
    }
  }


  // If the flow reaches this point, it means the condition (a < b && b < c) was not met.
  console . log ( 'No' ) ; // Therefore, print 'No' to standard output.


  // Display/Debugging section (originally commented out).
  // console.log(inputs); // This line was originally for debugging purposes, showing the parsed input array.
  // It remains commented out to maintain the original program's behavior.

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // The IIFE is invoked with the content of /dev/stdin.