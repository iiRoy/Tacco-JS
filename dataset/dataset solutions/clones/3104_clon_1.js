/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered
 * to create a visually distinct, yet functionally identical, version.
 */

'use strict' ; // Enforce strict mode for cleaner code.


/**
 * The main entry point function for processing input.
 *
 * @param {string} input - The raw input string, typically from stdin.
 */
function   Main ( input )
{

    // Split the entire input string into an array of lines.
    input = input . split ( "\n" ) ;


    // The second line (index 1) contains the string to be searched.
    const   tmp   =   input [ 1 ] ;


    // All subsequent lines (from index 2 onwards) are the questions/queries.
    const   question   =   input . slice ( 2 ) ;


    // Iterate through each question provided in the input.
    for ( const q   of   question )
    {

        // For each query line, split it by space to get the start and end indices.
        const   qv   =   q . split ( " " ) ;

        // Extract the substring from 'tmp' based on the query's start (qv[0]) and end (qv[1]) indices.
        // Note: qv[0] is 1-based, so we subtract 1 for 0-based slicing.
        let   test   =   tmp . slice ( qv [ 0 ] - 1 ,   qv [ 1 ] ) ;

        // Count occurrences of 'AC' within the 'test' substring.
        // By splitting by 'AC', the length of the resulting array will be (count of 'AC' + 1).
        // So, subtracting 1 gives the actual count.
        console . log ( test . split ( 'AC' ) . length   -   1 ) ;

    } // End of query processing loop.

} // End of Main function.


// Invoke the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;