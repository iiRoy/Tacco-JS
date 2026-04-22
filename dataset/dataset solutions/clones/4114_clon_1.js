/*
 * This is a Type I clone generated from an original JavaScript source.
 *
 * According to the Type I definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * This clone adheres strictly to these rules.
 * All variable names, function names, operators, and expressions
 * are identical to the original.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been added or modified to create a visually distinct but
 * functionally identical piece of code.
 */

/**
 * The primary function responsible for processing input and producing output.
 * It takes a string input, converts it to an integer, and performs a simple calculation.
 *
 * @param {string} input - The raw string input, expected to be a numeric value.
 */
function   main   (   input   )
{
    // Convert the incoming string 'input' into an integer (base 10).
    // The result overwrites the original 'input' parameter.
    input   =   parseInt   (   input   ,   10   )   ;

    // Perform the calculation: subtract the parsed integer from the constant 48.
    // The result of this operation is then printed to the console.
    console   .   log   (   48   -   input   )   ;   // Output the computed difference.

} // End of the main function.


// This line is responsible for initiating the program flow.
// It reads data from standard input ('/dev/stdin') using Node.js's 'fs' module.
// The read data is then passed as an argument to the 'main' function.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;