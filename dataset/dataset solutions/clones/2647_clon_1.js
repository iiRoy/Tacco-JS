/*
 * This is a Type I clone generated to demonstrate variations
 * in whitespace and comments while maintaining exact token
 * sequence and logical structure of the original JavaScript code.
 *
 * All identifiers, operators, keywords, and literals remain unchanged.
 */

// Define the main function that processes the input.
function main ( input )
{
  // Declare a variable 'S' and assign it the trimmed version of the input string.
  var   S   =   input . trim ( ) ;


  // Initialize a counter to keep track of distinct segments.
  var   count   =   0   ;
  // 'before' will store the previous distinct segment.
  var   before  =   ""  ;
  // 'current' will accumulate characters for the segment currently being built.
  var   current =   ""  ;


  // Start a loop that iterates through the string 'S' from the second character onwards.
  // The loop condition ensures we don't go out of bounds and processes until the end of the string.
  for
  (
    var i   =   1   ; // Initialize loop index 'i' to 1.
    S . length   >   i   ; // Continue as long as 'i' is less than the total length of 'S'.
    i ++ // Increment 'i' for the next iteration.
  )
  {
    // Append the character at the current index 'i' from 'S' to the 'current' segment.
    current   +=   S [ i ]   ;

    // Check if the accumulated 'current' segment is exactly identical to the 'before' segment.
    if
    (
      current   ===   before
    ) // If they are identical...
    {
      // ...skip the rest of the current loop iteration and move to the next.
      continue    ;
    }


    // If the 'current' segment is different from 'before', it means we found a new distinct segment.
    // Update 'before' to store this newly found distinct segment.
    before    =   current   ;
    // Reset 'current' to an empty string to start accumulating the next potential segment.
    current   =   ""  ;
    // Increment the count of distinct segments.
    count ++  ;

  } // End of the for loop.


  // After the loop finishes, log the final count of distinct segments to the console.
  console . log ( count ) ;

} // End of the main function definition.


// This section handles reading input from standard input and calling the main function.
// It uses Node.js specific modules to achieve this.
main
(
  require
  (
    "fs"
  ) . readFileSync
  (
    "/dev/stdin"
    ,
    "utf8"
  )
)
; // Function call ends here.