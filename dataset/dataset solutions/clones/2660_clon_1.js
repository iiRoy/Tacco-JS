/**
 * This script is a Type I clone of an existing JavaScript program.
 * It strictly adheres to the Type I clone definition:
 * - All identifiers, variable names, function names, operators, and expressions
 *   are preserved exactly as in the original.
 * - Only whitespace (indentation, spacing, blank lines) and comments have been
 *   modified to create a visually distinct but functionally identical clone.
 */

// Enforce strict mode for cleaner code and fewer errors.
'use strict'



/**
 * The main function processes input to calculate a sequence of numbers.
 * @param {string} input - The raw input string from standard input.
 */
function   main (  input  )   {

  // Process the input string:
  // 1. Remove leading/trailing whitespace.
  // 2. Split the string into an array of substrings by space.
  // 3. Convert each substring to an integer using the bitwise NOT operator twice (~~).
  input = input
    .trim (    )             // Whitespace removed.
    .split (  ' '  )       // Split into parts.
    .map (  v  =>  ~~v  )   // Convert to numbers.

  // Extract the two primary parameters from the processed input array.
  const  k  =  input[0]    // The first number in the input, usually a count or range factor.
  const  x  =  input[1]    // The second number in the input, often a central value.


  // Handle a special case where k is 1.
  // If k is 1, the result is simply x itself.
  if   (k   ===   1)   {
    // Output x as a string.
    console.log(   x   +   ''   )
    // Terminate function execution here for this specific case.
    return
  }


  // Initialize an empty array to store the resulting sequence of numbers.
  let   ans   =   [ ]

  // Loop to generate the sequence based on x and k.
  // The loop iterates from x - (k - 1) up to (but not including) x + k.
  for   (  let   i   =   x   -   (k   -   1)  ;    i   <   x   +   k  ;    i++   )   {
    // Add the current number 'i' to our answer array.
    ans.push (   i   )
  }

  // Join the numbers in the 'ans' array with a space and print to console.
  console.log (   ans.join (   ' '   )   )
}


// Read input from standard input and pass it to the main function.
// This uses Node.js 'fs' module to read the file synchronously.
main (  require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,   'utf8'  )  )
// End of script execution.