/*
 * This is a JavaScript program designed to process input data.
 * It demonstrates string manipulation and conditional logic within a loop.
 * The primary goal is to rearrange elements based on their index parity relative to the total count.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

'use strict'; // Enforce strict mode for better error handling and cleaner code practices.


function   main   (   input   )   {

    // Pre-process the raw input string.
    // First, split the input by newline characters to get individual lines.
    // Then, for each line, split it by space characters to get an array of strings.
    input  =  input . split ( '\n' ) . map ( v  =>  v . split ( ' ' ) ) ;

    // Extract the total number of elements expected from the first line's first element.
    const   n   =   input [ 0 ] [ 0 ] ;

    // Retrieve the array of numbers (as strings) from the second line of the input.
    const   nums   =   input [ 1 ] ;


    // Initialize the answer string.
    // It starts with the first element of the 'nums' array.
    // `slice(0, 1)` creates a new array containing only the first element,
    // and `toString()` converts that single-element array into a string.
    let   ans   =   nums . slice ( 0 , 1 ) . toString ( ) ;


    // Loop through the 'nums' array, starting from the second element (index 1)
    // up to, but not including, the total number of elements 'n'.
    for   (   let   i   =   1   ;   i   <   n   ;   i ++   )   {

        // Apply conditional logic based on the parity (even or odd) of the current index 'i'
        // and the parity of the total count 'n'.
        if   (   i   %   2   ==   n   %   2   )   {
            // If both 'i' and 'n' have the same parity (both even or both odd),
            // append the current number to the 'ans' string, separated by a space.
            ans   =   ans   +   ' '   +   nums [ i ] ;
        }   else   {
            // Otherwise (if 'i' and 'n' have different parities),
            // prepend the current number to the 'ans' string, separated by a space.
            ans   =   nums [ i ]   +   ' '   +   ans ;
        }
    }


    // Output the final constructed 'ans' string to the standard console.
    console . log ( ans ) ;

}   // End of the main function definition.


// Immediately invoke the main function.
// It reads the entire content of '/dev/stdin' (standard input file)
// as a UTF-8 encoded string using Node.js's file system module.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )   ) ;