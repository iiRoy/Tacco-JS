/*
 * This is a Type I code clone of the original JavaScript snippet.
 * As per the definition, all identifiers, variable names, function names,
 * operators, and expressions remain completely unchanged.
 *
 * The only modifications made are to whitespace (indentation, spacing, blank lines)
 * and comments (addition, removal, or modification of comments).
 * These changes are applied extensively throughout the file to make the
 * result visually distinct from the original, while maintaining exact
 * logical and structural equivalence.
 */

"use strict"
; // This directive enables strict mode, helping to write cleaner code.


// Define the primary function responsible for processing the input.
const   main    =   (   arg   )   =>
{
    // The input argument `arg` is first trimmed of leading/trailing whitespace.
    // Then, it is split into an array of strings based on newline characters.
    arg     =   arg
        .trim(  ) // Remove any superfluous whitespace from the start and end.
        .split(   "\n"   )   ; // Break the string into an array of lines.

    // From the array of lines, we take the very first line (at index 0).
    // This first line is then split by commas to form a new array `S`.
    const   S   =   arg   [   0   ]
        .split(   ","   )   ; // Split the first line into elements using a comma delimiter.

    // Finally, the elements of array `S` are joined together with a single space
    // between each element, and the resulting string is printed to the console.
    console .   log   (   S   .   join   (   " "   )   )   ;
}   ; // End of the 'main' function definition.


// This section of code executes the 'main' function.
// It reads all data from standard input ('/dev/stdin') using Node.js's
// 'fs' (file system) module, ensuring it's interpreted as UTF-8 text.
main(   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;
// The program concludes after the 'main' function has been invoked.