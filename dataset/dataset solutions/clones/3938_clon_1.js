/*
 * This JavaScript program processes numerical input.
 * It demonstrates reading from standard input,
 * parsing data, and performing basic arithmetic operations.
 *
 * The goal is to calculate a specific sum based on
 * four input numbers.
 */

// Declare and initialize variables 'a', 'b', 'c', and 'd'.
// These variables will hold numerical values read from the input stream.
let   [ a ,   b   , c    , d ]    =

    // Utilize the Node.js 'fs' (file system) module
    // to read data from a specified source.
    require ( "fs" )

        // Synchronously read the content of '/dev/stdin'.
        // This is typically used for standard input in a Unix-like environment.
        .readFileSync (     "/dev/stdin"   ,   "utf8"   )

        // Split the entire string content by newline characters.
        // This creates an array where each element is a line from the input.
        .split (   "\n"   )

        // Map each string element in the array to its numerical representation.
        // The 'Number' constructor is used as a mapping function.
        .map (    Number    )   ; // Semicolon terminates the declaration and assignment.


// Output the final computed result to the console.
// The calculation involves finding the minimum of pairs of numbers and summing these minimums.
console.log (
    // Calculate the minimum value between 'a' and 'b'.
    Math.min (   a   ,   b   )

    // Add the result of the first minimum calculation to the second.
    +

    // Calculate the minimum value between 'c' and 'd'.
    Math.min (   c   ,   d   )
) ;

// End of the program logic.