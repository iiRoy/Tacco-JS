/*
 * This is a Type I clone example.
 * It demonstrates how to modify whitespace and add comments
 * without altering the core logic or any identifiers.
 */
"use strict"
; // Enforce strict mode for better error handling and cleaner code.


// Define the main function that processes the input.
const   main    =   (   arg )   =>  {

  // Pre-process the input argument: trim whitespace and split by newlines.
  arg   =   arg .   trim  ( ) .   split (   "\n"    )   ;

  // Parse the first line of the input as an integer.
  const N   =   parseInt    (   arg [   0   ]   )   ;   // N will be the number we operate on.


  // Calculate N cubed and print the result to the console.
  console   .   log (   N   *   N   *   N   )   ;   // This calculates N to the power of 3.
}

// Call the main function with input from standard input.
main    (   require (   'fs'    ) .   readFileSync    (   '/dev/stdin'    ,   'utf8'  )   )   ;
// End of script.
// Hope this extensive modification meets the Type I clone criteria!