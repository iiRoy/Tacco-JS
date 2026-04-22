/*
 * This is a JavaScript program designed to process three numerical inputs.
 * It calculates the product of the first two numbers and then determines
 * the minimum between this product and the third number provided.
 *
 * This specific version is a Type I clone, focusing on extensive
 * variations in whitespace and the inclusion of comments to
 * visually differentiate it from the original source code,
 * while maintaining identical logical and structural integrity.
 *
 * Author: AI Code Generation System
 * Date: October 26, 2023
 */

// Define the primary function responsible for handling the input and logic.
function    Main   (   input   )    {

    // First, process the raw input string.
    // It's expected to be a space-separated string of numbers.
    // We split it into an array of strings, then map each string to its numerical representation.
    const   numbers     =   input   .   split   (   ' '   )   .   map   (   n   =>    Number   (   n   )   )   ;


    // Calculate the product of the first two numbers from the 'numbers' array.
    // These are accessed using array indexing: numbers[0] and numbers[1].
    const   p1      =   numbers   [   0   ]    *    numbers   [   1   ]   ;

    // Extract the third number from the 'numbers' array.
    // This will be used for comparison.
    const   p2      =   numbers   [   2   ]   ;


    // Now, perform the core logic: compare p1 and p2.
    // The goal is to print the smaller of the two values.
    if    (   p1    >    p2   )   {
        // If p1 is strictly greater than p2, then p2 is the minimum.
        console   .   log   (   p2   )   ;
    }   else    {
        // Otherwise (if p1 is less than or equal to p2), p1 is the minimum.
        console   .   log   (   p1   )   ;
    }

} // End of the Main function definition.


// This section handles the execution of the program.
// It reads input from standard input (/dev/stdin) using Node.js's 'fs' module.
// The input is read synchronously as a UTF-8 encoded string.
// Finally, this string is passed to the 'Main' function for processing.
Main    (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;