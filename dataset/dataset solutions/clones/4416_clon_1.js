/*
 * This JavaScript function processes an array of numbers,
 * performing some calculations based on conditional logic.
 * It's designed to read input, parse it, and then print a result.
 */

function Main ( input )
{
  // The input string is expected to contain space-separated values.
  // We split it into an array of strings.
  input = input . split ( " " ) ;

  // Parse each string in the input array into an integer.
  // The radix 10 is specified for decimal parsing.
  input [ 0 ] = parseInt ( input [ 0 ] , 10 ) ;

  // Process the second element.
  input [ 1 ] = parseInt ( input [ 1 ] , 10 ) ;

  // Process the third element.
  input [ 2 ] = parseInt ( input [ 2 ] , 10 ) ;

  // Process the fourth element.
  input [ 3 ] = parseInt ( input [ 3 ] , 10 ) ;


  // Evaluate the first condition: if the third value is greater than or equal to the second.
  if ( input [ 2 ] >= input [ 1 ] )
  {
    // If true, print 0 and exit this block.
    console . log ( 0 ) ;
  }
  // Otherwise, check the second condition: if the fourth value is less than or equal to the first.
  else if ( input [ 3 ] <= input [ 0 ] )
  {
    // If true, print 0 and exit this block.
    console . log ( 0 ) ;
  }
  // If neither of the above conditions is met, proceed with calculations.
  else
  {
    /*
     * Determine the 'start' value.
     * It's the maximum of input[0] and input[2].
     */
    if ( input [ 0 ] < input [ 2 ] )
    {
      var start = input [ 2 ] ; // Assign input[2] if it's greater.
    }
    else
    {
      var start = input [ 0 ] ; // Assign input[0] otherwise.
    }


    /*
     * Determine the 'end' value.
     * It's the minimum of input[1] and input[3].
     */
    if ( input [ 1 ] < input [ 3 ] )
    {
      var end = input [ 1 ] ; // Assign input[1] if it's smaller.
    }
    else
    {
      var end = input [ 3 ] ; // Assign input[3] otherwise.
    }

    // Finally, print the difference between 'end' and 'start'.
    console . log ( '%d' , end - start ) ;
  }
}

// Call the Main function with input read from standard input.
// This line uses Node.js specific modules for file system operations.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;