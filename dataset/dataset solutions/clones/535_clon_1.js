/*
 * This is a Type I clone generated from the original JavaScript snippet.
 * It demonstrates extensive use of whitespace and comments without altering
 * the core logic, variable names, or expressions.
 *
 * All identifiers, operators, and expressions remain precisely as they were
 * in the original code.
 */


// Import the 'fs' (file system) module, which provides functionality
// for interacting with the file system, including reading files.
var   input   =   require (   'fs'   ) .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;


    // Declare a variable named 'arr'.
    // It processes the 'input' string:
    // 1. '.trim()' removes any leading or trailing whitespace.
    // 2. '.split(" ")' divides the string into an array of substrings,
    //    using a single space as the delimiter.
    // 3. '.map(Number)' converts each string element in the array to a number.
var     arr     =     input.trim().split(" ").map(Number)     ;


/*
 * This final section calculates and outputs the result.
 * It computes the average of the first two elements of the 'arr' array.
 * Specifically, it sums 'arr[0]' and 'arr[1]', then divides the sum by 2.
 * The 'console.log()' function is used to print this value to the standard output.
 */
console.log (   (   arr[0]   +   arr[1]   )   /   2   )   ;   // The calculated average is displayed here.

// Script execution concludes.