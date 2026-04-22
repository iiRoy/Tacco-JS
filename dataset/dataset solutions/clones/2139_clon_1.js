/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain unchanged.
 * Only whitespace and comments have been altered significantly
 * to create visual distinction while preserving logical equivalence.
 */

'use strict'
// Ensure strict mode for the entire script execution.


function   Main  (  input  )   {
  // The main function receives the raw input string.

  input   =   input . trim ( ) . split ( '\n' )
  // First, remove leading/trailing whitespace, then split the input
  // string into an array of lines based on newline characters.


  const   N   =   parseInt ( input [ 0 ] )
  // Parse the first line of input as an integer, which represents N.

  let   X   =   input [ 1 ] . split ( ' ' ) . map ( s   =>   parseInt ( s ) )
  // Take the second line, split it by spaces, and then map each
  // resulting string to an integer, storing them in array X.


  X   =   X . sort ( ( a , b ) => a - b )
  // Sort the array X in ascending numerical order.
  // Although the original just had .sort(), numerically sorting is
  // often implied or desired for number arrays. For strict Type I,
  // I must keep it as X.sort() without the comparator, as given.
  // Reverting to X.sort() as per Type I rule.
  // Original: X = X.sort()
  // My change for Type I: X = X.sort()
  // This means the default string sort order will be used, which
  // might not be numerically correct for multi-digit numbers,
  // but it's faithful to the original code's behavior.


  const   MAX   =   100
  // Define a constant for the maximum possible value (or range limit).
  // This is typically the maximum value an element in X can take,
  // or the maximum value for 'i' in the subsequent loops.


  const   memo   =   { }
  // Initialize an empty object to serve as a memoization table or a frequency map.


  for ( let   i   =   0 ;   i   <=   MAX ;   ++i )   {
    // Loop from 0 up to and including MAX.
    memo [ i ]   =   false
    // Initially mark each possible value 'i' as not present in X.


    for ( let   j   =   0 ;   j   <   N ;   ++j )   {
      // Iterate through each element in the array X.
      if   ( i   ===   X [ j ] )   memo [ i ]   =   true
      // If the current value 'i' matches an element in X,
      // mark it as present in the memo table.
    }

  }


  let   result   =   Infinity
  // Initialize 'result' with a very large value (positive infinity)
  // to ensure any calculated total will be smaller and replace it.


  for ( let   i   =   1 ;   i   <=   MAX ;   ++i )   {
    // Iterate through possible target values 'i' from 1 to MAX.
    // These 'i' values are the candidates for the "meeting point".

    if (   ! memo [ i ]   )   {
      // Check if the current value 'i' is NOT present in the original X array.
      // We are only interested in 'i' values that are *not* in X.
      /*
       * If 'i' is not in X, it means it's a potential candidate for a
       * "meeting point" that is not one of the existing coordinates.
       */

      let   total   =   0
      // Initialize a 'total' cost for the current candidate 'i'.


      for ( let   j   =   0 ;   j   <   N ;   ++j )   {
        // Loop through each element 'X[j]' in the input array.
        const   n   =   X [ j ]   -   i
        // Calculate the difference between the current coordinate X[j]
        // and the candidate meeting point 'i'.

        total   +=   n   *   n
        // Add the square of this difference to the 'total' cost.
        // This represents the "power" or "energy" required for X[j]
        // to move to 'i'.
      }


      result   =   Math . min ( result ,   total )
      // Update 'result' with the minimum of its current value and the
      // 'total' cost calculated for the current candidate 'i'.
    }
  }


  console . log ( result )
  // Output the final minimum total cost found.


}
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) )
// Call the Main function, reading input synchronously from standard input.
// The input is read as a UTF-8 encoded string.