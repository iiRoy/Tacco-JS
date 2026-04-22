/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they were in the original.
 * Only whitespace and comments have been modified to create a visually
 * different, yet functionally identical, version.
 */
// Ensure strict mode for cleaner code execution.
'use strict'


// Define the main function that processes the input.
const   main    =   (   input   )   =>  {
    // Trim whitespace from the input string.
    const   s   =   input   .   trim  (  )   ;


    /*
     * Attempt to match a substring starting with 'A' and ending with 'Z'.
     * The '.*' is a greedy match for any character (except newline) zero or more times.
     */
    const   md  =   s   .   match  (  /A.*Z/  )   ;


    // Check if a match was found.
    if  (   md  )   {
        // If a match exists, log the length of the matched substring (the first element of the match array).
        console   .   log  (  md  [  0  ]  .   length  )   ;
    }
    else    {
        // If no match was found, log 0.
        console   .   log  (  0  )   ;
    }
}


// Execute the main function by reading input from standard input.
// This part reads the file synchronously and decodes it as UTF-8.
main  (  require  (  'fs'  )  .   readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )   ;

// End of Type I clone.