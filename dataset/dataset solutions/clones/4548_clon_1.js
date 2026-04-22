// This JavaScript program processes numeric input.
// It calculates a sum and then modifies it based on specific conditions.

function main ( data )
{
  // Split the raw input string by newline characters into an array of lines.
  input = data.split( "\n" ) ;

  // The first element of the input array is treated as the initial length.
  len = input[ 0 ] ;

  // Initialize a variable to accumulate the total sum.
  total = 0 ;

  /*
   * This loop iterates from the second element (index 1) up to the
   * value specified by 'len' (which was the first line of input).
   * It parses each element as an integer (base 10) and adds it to 'total'.
   */
  for ( i = 1 ; i <= len ; i += 1 )
  {
    // Add the parsed integer value of the current input line to the running total.
    total += parseInt( input[ i ] , 10 ) ;
  } // End of the initial sum calculation loop.


  // This main processing loop continues as long as the 'total' is a multiple of 10.
  while ( total % 10 === 0 )
  {
    // Initialize 'min' to a value greater than any expected input number (e.g., 1 to 100).
    min = 101 ;
    // Initialize 'index' to -1, indicating no minimum has been found yet.
    index = -1 ;

    // This inner loop searches for the smallest number in the *remaining* 'input' array.
    // Note: 'len' is re-assigned here to the current length of the 'input' array.
    for ( i = 1 , len = input.length ; i < len ; i += 1 )
    {
      // Compare the current 'min' with the numeric value of the current array element.
      if ( min > input[ i ] )
      {
        // If a smaller number is found, update 'min' and its 'index'.
        min = parseInt( input[ i ] , 10 ) ; // Update the minimum value.
        index = i ; // Store the index where this minimum was found.
      }
    } // End of the loop for finding the minimum element.


    // Remove the smallest found element from the 'input' array using its 'index'.
    input.splice( index , 1 ) ;

    // Subtract the value of the removed minimum element from the 'total'.
    total -= min ;


    // Check if the 'total' has become zero or negative after the subtraction.
    if ( total <= 0 )
    {
      total = 0 ; // Ensure 'total' is not negative, set it explicitly to 0.
      break ; // Exit the 'while' loop immediately.
    }
  } // End of the main 'while' loop.


  // After the loops complete, print the final calculated 'total' to the console.
  console.log( total ) ;

} // End of the 'main' function definition.


// This line executes the 'main' function.
// It reads input from standard input ('/dev/stdin') using Node.js's 'fs' module,
// and passes the content as a UTF-8 string to the 'main' function.
main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;

// --- End of Script ---