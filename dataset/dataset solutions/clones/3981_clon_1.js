/*
 * This JavaScript file is a Type I clone of an original source.
 * It's designed to demonstrate how code can be visually altered
 * while maintaining absolute logical and structural equivalence.
 *
 * According to the Type I definition:
 * - All identifiers, variable names, function names, operators, and expressions
 *   are preserved without any modification whatsoever.
 * - The only permissible changes are variations in whitespace (spaces, tabs,
 *   newlines) and the addition, removal, or modification of comments.
 *
 * This version extensively applies these allowed changes to present a
 * significantly different visual layout compared to the original code.
 */
"use strict" ; // This directive enables strict mode, catching common coding errors.


const   Main    =    (    input    )    =>    {

    // Output the raw, unmodified input string to the console.
    // This can be useful for debugging or verifying the input content.
    console . log (   input   )   ;


    // First, process the input string:
    // 1. Remove any leading or trailing whitespace using `trim()`.
    // 2. Split the cleaned string into an array of lines, using the newline character as a delimiter.
    const   Array   =   input . trim ( ) . split ( /\n/ )   ;


    // Next, parse specific lines from the `Array` generated above.

    // Line 1 (index 0): Split it into parts wherever a non-digit character occurs.
    const   Array1   =   Array [ 0 ] . split ( /\D/ )   ;

    // Line 2 (index 1): Apply the same non-digit splitting logic.
    const   Array2   =   Array [ 1 ] . split ( /\D/ )   ;

    // Line 3 (index 2): And again for the third line.
    const   Array3   =   Array [ 2 ] . split ( /\D/ )   ;


    // Construct the final answer by concatenating specific elements.
    // This uses template literals for string interpolation.
    // - The first element from `Array1` (index 0).
    // - The second element from `Array2` (index 1).
    // - The third element from `Array3` (index 2).
    const   Answer   =   `${ Array1[0] }${ Array2[1] }${ Array3[2] }`   ;


    // Finally, output the computed `Answer` to the console.
    console . log (   Answer   )   ;

}   ;  // Concluding the definition of the Main function.


// This is the primary execution block of the script.
// It reads input from standard input (`/dev/stdin`) using Node.js's `fs` module,
// decodes it as 'utf8', and then passes it to the `Main` function for processing.
Main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )   )   ;