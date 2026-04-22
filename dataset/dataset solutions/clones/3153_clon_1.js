/*
 * This is a JavaScript function designed to solve a specific problem.
 * It processes an input string, parses numbers, and performs calculations.
 * The goal is to find the K-th common divisor between two numbers.
 */

function   main  ( input )
{
  // --- Start of variable declarations and initializations ---
  // Split the input string by space to get individual arguments.
  const   args   =   input .   split (   ' '   )  ;



  /*
   * Convert the first argument to a number and assign it to A.
   */
  let   A   =   Number (   args [   0   ]   )  ;

  // Convert the second argument to a number and assign it to B.
  let   B   =   Number (   args [   1   ]   )  ;

  // Convert the third argument to a number and assign it to K.
  let   K   =   Number (   args [   2   ]   )  ;


  // Determine the order of A and B for the array 'Arr'.
  // This ensures Arr[0] is always the smaller number, and Arr[1] is the larger.
  let   Arr   =   A   <   B   ?   [   A  ,   B   ]   :   [   B  ,   A   ]  ;

  // Initialize a counter variable 'cu' (current divisor candidate).
  let   cu   =   0  ;

  // Declare 'sum' without initial value; it will store the K-th divisor.
  let   sum  ;

  // Initialize 'count' to keep track of how many common divisors have been found.
  let   count   =   0  ;

  // --- End of variable declarations ---




  /*
   * This is the main loop to find common divisors.
   * It iterates downwards from the smaller of the two numbers (Arr[0]).
   */
  for   (   cu   =   Arr [   0   ]  ;   cu   >   0  ;   --cu   )
  {
    // Check if 'cu' is an integer divisor of both Arr[0] and Arr[1].
    // Number.isInteger() is used for precise integer checking.
    if   (   Number .   isInteger (   Arr [   0   ]   /   cu   )   &&   Number .   isInteger (   Arr [   1   ]   /   cu   )   )
    {
      // If 'cu' is a common divisor, increment the count.
      count ++  ;

      // If the current count matches K, we have found the K-th common divisor.
      if   (   count   ===   K   )
      {
        // Store the value of 'cu' in 'sum'.
        sum   =   cu  ;
        // Exit the loop as the desired divisor has been found.
        break  ;
      }
    }
  }


  /*
   * After the loop, print the found K-th common divisor.
   * Note: The problem actually asks to print 'cu', which will hold the value of the K-th divisor
   * because the loop breaks right after assigning 'cu' to 'sum'.
   */
  console .   log (   cu   )  ;

}

// --- Main execution block ---
// Read input from standard input (/dev/stdin) using 'fs' module.
// The input is expected to be UTF-8 encoded.
// Then, call the 'main' function with the read input.
main (   require (   'fs'   ) .   readFileSync (   '/dev/stdin'  ,   'utf8'   )   )  ;

// EOF - End of File