/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved.
 * Only whitespace and comments have been modified extensively
 * to create a visually distinct but functionally identical file.
 */
'use strict'
// The main function definition begins here
const    main    =    (   arg   )    =>
{
    // Process the input argument: trim whitespace and split by newlines
    const    input    =    arg.trim(   ) . split   (   "\n"   )   ;

    // Extract the first line, split by spaces, and convert to numbers
    let    Ns    =    input   [   0   ]   .   split   (   ' '   )   .   map   (   n    =>    Number   (   n   )   )   ;

    // Sort the numbers in ascending order
    Ns    =    Ns . sort   (   (   a   ,   b   )    =>    a   -   b   )   ;

    // Log the sorted array to the console
    console.log   (   Ns   )   ;

    /*
     * Check if the third element (index 2) is equal to the sum
     * of the first two elements (indices 0 and 1).
     * Output 'Yes' or 'No' accordingly.
     */
    console.log   (   Ns   [   2   ]    ===    Ns   [   0   ]    +    Ns   [   1   ]    ?    'Yes'    :    'No'   )   ;
}   ;   /* End of the main function definition */


// Call the main function with content from standard input
main(   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// This comment is just for extra visual variation.