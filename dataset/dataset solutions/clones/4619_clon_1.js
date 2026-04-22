"use strict" ; /* This directive enables strict mode, ensuring cleaner code and catching common errors. */

// Define the primary function responsible for processing the input.
function   main  (   input   )
{
    /*
     * Declare a constant variable 'args'.
     * This variable will store an array of processed strings.
     */
    const   args   =
        input
            .  trim  (  ) // First, remove any leading or trailing whitespace from the input string.
            .  split  (  ' '  ) // Then, split the cleaned string into an array of substrings, using a space as the delimiter.
            .  map  (  _  =>    _[0]  .  toUpperCase  (  )  ) ; // Finally, for each substring, take its first character and convert it to uppercase.

    // Output the concatenated results to the console.
    console
        .  log  (
            // Concatenate the first, second, and third elements of the 'args' array.
            args  [  0  ]
            +   args  [  1  ]
            +   args  [  2  ]
        ) ;
} // End of the main function definition.


/*
 * Call the 'main' function immediately.
 * The input for 'main' is read from standard input.
 */
main  (
    require  (  'fs'  ) // Utilize Node.js's built-in 'fs' (file system) module.
        .  readFileSync  (  '/dev/stdin'  ,    'utf8'  ) // Read the entire content of '/dev/stdin' (standard input) as a UTF-8 encoded string.
) ; // Script execution concludes after the main function is called.