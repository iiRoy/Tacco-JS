/*
 * This JavaScript code is a Type I clone.
 * It is derived from an original source, with modifications strictly limited
 * to whitespace adjustments and the addition, removal, or alteration of comments.
 * All functional elements, including identifiers, operators, and expressions,
 * remain precisely as they were in the original code.
 */
"use strict"
; /* Enable strict mode for better error handling and cleaner code. */


// Define the primary execution function.
const   main    =   (   input   )   =>
{
  // Process the raw input: trim leading/trailing whitespace and split into an array of lines.
  const array   =   input   .   trim   (   )   .   split   (   '\n'   )   ;


  // Extract the first element of the array and parse it as an integer (base 10).
  const num     =   parseInt   (   array   [   0   ]   ,   10   )   ;


  // Extract the second element, split it by spaces, creating an array of 'color' strings.
  const color   =   array   [   1   ]   .   split   (   ' '   )   ;


  // Initialize a counter to track the number of 'changes' (consecutive identical colors).
  let change    =   0   ;


  /*
   * Iterate through the 'color' array.
   * The loop runs from the first element up to the second-to-last element,
   * as each iteration compares the current element with the next one.
   */
  for   (   let   i   =   0   ;   i   <   num   -   1   ;   i++   )
  {
    // Check if the current color is identical to the subsequent color.
    if   (   color   [   i   ]   ==   color   [   i   +   1   ]   )
    {
      // If a match is found, increment the 'change' counter.
      change++   ;
      // Also, increment 'i' again to effectively skip the next element,
      // as it has already been considered in the current pair.
      i++   ;
    }
  }


  // Output the final count of 'changes' to the standard output.
  console   .   log   (   change   )   ;

}


// The entry point of the script:
// Reads the content of '/dev/stdin' synchronously using Node.js 'fs' module,
// decodes it as UTF-8, and passes it as input to the 'main' function.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;