/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition: only whitespace
 * and comments have been altered.
 * No identifiers, operators, or expressions have been changed.
 */


// Define the primary function named 'main'.
// It takes a single argument, 'input', which is expected to be a string.
const   main    =   (   input   )   =>  {

    // Declare a constant variable 'a'.
    // This variable will hold the numerical representation of the trimmed input.
    // The 'trim()' method removes whitespace from both ends of a string.
    const   a   =   Number  (   input.trim  (   )   )   ;

    // Calculate and return the sum of 'a', 'a' squared, and 'a' cubed.
    // The '**' operator denotes exponentiation.
    return  a   +   a   **  2   +   a   **  3   ;

}   ; // End of the 'main' function definition.


// This section handles reading input from standard input,
// processing it with the 'main' function, and then outputting the result.

// 'require('fs')' loads the Node.js file system module.
// 'readFileSync('/dev/stdin', 'utf8')' reads the entire content
// of the standard input file as a UTF-8 encoded string.
// The result of 'main()' is then printed to the console.
console .   log (   main    (   require (   'fs'    )   .   readFileSync  (   '/dev/stdin'    ,   'utf8'  )   )   )   ;

// End of the JavaScript script.