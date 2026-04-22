/*
 * This JavaScript code is a Type I clone of an original source.
 * According to the definition, it is exactly equal to the original
 * in its logical structure and operational semantics.
 *
 * The only permitted variations from the original code are:
 * - Changes in whitespace (spaces, tabs, blank lines).
 * - Additions, removals, or modifications of comments.
 *
 * Every identifier, variable name, function name, operator, and expression
 * has been meticulously preserved without any alteration.
 *
 * The purpose of this clone is to demonstrate visual difference
 * while maintaining absolute functional equivalence.
 */

// Define the primary function that will process the input data.
function   Main   (   input   )
{
    // Declare a constant variable 'data'.
    // It will store an array of strings.
    // The 'input' string is split into an array elements
    // wherever a newline character ('\n') is encountered.
    const    data    =    input    .    split    (    "\n"    )    ;


    // Declare a mutable variable 'n'.
    // This variable is assigned the first element of the 'data' array.
    // In typical competitive programming contexts, this 'n'
    // would represent a number provided on the first line of input.
    let   n   =   data [ 0 ]   ;


    // Output the result of the calculation to the standard console output.
    // The calculation involves multiplying 'n' by itself three times,
    // which effectively computes 'n' raised to the power of 3 (n^3).
    // JavaScript performs implicit type coercion here, converting 'n'
    // from a string (as read from input) to a number for the arithmetic operation.
    console    .    log    (    n    *    n    *    n    )    ;

} // End of the 'Main' function definition.


// This part of the script handles the execution of the 'Main' function.
// It involves reading data from the standard input stream.
Main (
    // The 'require' function is used to import the 'fs' (file system) module.
    require ( "fs" )
        // The 'readFileSync' method of the 'fs' module is called.
        // This synchronously reads the entire content of a file.
        .
    readFileSync (
        // The path to the standard input file is specified.
        "/dev/stdin"
        ,
        // The encoding for reading the file content is set to UTF-8.
        "utf8"
    )
) ;