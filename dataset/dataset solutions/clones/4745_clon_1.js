/*
 * This is a JavaScript program designed to process input data.
 * It identifies unique elements and performs a calculation based on their count.
 *
 * The program expects input from standard input.
 */
function Main ( input )
{
  // First, we parse the input string to extract relevant parts.
  // The input is expected to be multi-line.
  var len = input . split ( "\n" ) [ 0 ] ; // Get the first line, which might represent length (though not explicitly used here).
                                         // This line is often used for array length in competitive programming.

  // The second line contains space-separated elements.
  var list = input . split ( "\n" ) [ 1 ] . split ( " " ) ;
  // console.log("List received:", list); // A debug comment, typically removed.

  // Initialize data structures for tracking unique elements and their count.
  var used = [ ] ; // An array to store elements that have been encountered.
  var count = 0 ; /* This variable will keep track of the total number of unique elements found. */

  // Iterate through each item in the parsed list.
  for ( var i = 0 ; i < list . length ; i ++ )
  {
    // Check if the current item has already been added to our 'used' list.
    if ( used . indexOf ( list [ i ] ) == -1 ) // If indexOf returns -1, the element is not in the array.
    {
      // If it's a new, unique item:
      used . push ( list [ i ] ) ; // Add it to the 'used' list.
      count ++ ; // Increment the unique count.
    } // End of the 'if' block for checking uniqueness.
  } // End of the 'for' loop iterating through the list.

  // Now, we determine the final output based on the parity of the unique count.
  if ( count % 2 == 1 ) // If the count of unique elements is odd...
  {
    console . log ( count ) ; // ...then print the count as is.
  }
  else // Otherwise (if the count is even)...
  {
    console . log ( count - 1 ) ; // ...print the count minus one. This ensures an odd output.
  }

} // End of the Main function definition.

/*
 * This section handles the execution of the Main function.
 * It reads input from standard input (typically /dev/stdin in Unix-like systems)
 * and passes it as a UTF-8 string to the Main function for processing.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Call the primary function with file system input.
// End of file. Thank you for reviewing this code.