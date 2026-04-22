/*
 * This is a JavaScript function designed to solve a specific problem.
 * It takes an input string, processes it, and prints a result to the console.
 *
 * This code was generated as a Type I clone, meaning it is
 * functionally identical to the original, with only changes
 * to whitespace and comments.
 */
function   Main  (  arg  )
{
  // The input 'arg' is expected to be a string containing multiple lines.
  // First, we trim any leading/trailing whitespace from the entire input string.
  // Then, we split it into an array of strings, where each element represents a line.
  var arg = arg . trim ( ) . split ( '\n' ) ;


  // From the first line of the input (arg[0]), we extract two values.
  // The first value, parsed as a number, is assigned to 'x'.
  let x = Number ( arg [ 0 ] . split ( ' ' ) [ 0 ] ) ;
  // The second value, as a string, is assigned to 'n'.
  let n = arg [ 0 ] . split ( ' ' ) [ 1 ] ;


  // This conditional block checks if the value of 'n' is exactly '0'.
  // If 'n' is '0', it means a specific condition is met.
  if ( n == 0 )
  {
    console . log ( x ) ; // If n is 0, simply output the value of x.
    return ;              // Terminate the function's execution immediately.
  }


  // The second line of input (arg[1]) is expected to contain a space-separated list of numbers.
  // We split this line by spaces to get an array of these numbers (as strings).
  let p = arg [ 1 ] . split ( ' ' ) ;

  // This loop iterates from i = 1 up to 100 (inclusive).
  // Its purpose is to find the smallest integer 'i' such that either (x-i) or (x+i)
  // is not present in the array 'p'.
  for ( let i = 1 ; i < 101 ; i ++ )
  {
    // First, check if the number (x - i) is NOT present in the 'p' array.
    // The expression `${x - 1 * i}` creates a string representation of (x-i).
    // Note: '1 * i' is mathematically equivalent to 'i', but kept as in original for Type I.
    if ( ! p . includes ( `${ x - 1 * i }` ) )
    {
      console . log ( x - 1 * i ) ; // If (x - i) is not found in 'p', print it.
      return ;                      // And exit the function as the desired number is found.
    }
    // If (x - i) WAS found in 'p', then check if (x + i) is NOT present.
    else if ( ! p . includes ( `${ x + i }` ) )
    {
      console . log ( x + i ) ; // If (x + i) is not found in 'p', print it.
      return ;                  // And exit the function.
    }
  }

  // If the loop completes without finding any suitable number (i.e., all (x-i) and (x+i)
  // for i from 1 to 100 were found in 'p'), then an 'error' message is logged.
  console . log ( 'error' ) ;
  return ; // Final return statement for the function.
}

// This line reads input from standard input (/dev/stdin) using Node.js's file system module.
// The content is read as UTF-8 encoded text and then passed to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;