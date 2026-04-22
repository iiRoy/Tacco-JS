/*
 * This file contains a JavaScript program designed to process
 * numerical input from standard input.
 * It calculates a specific sum based on the input data.
 */
'use strict' // Enforce strict mode for better code quality.


// Define the main function that handles the program's logic.
function  main  (  input  )   {

    // Split the entire input string into an array of lines.
    input  =  input.split ( '\n' ) ;

    /*
     * Parse the first line of input.
     * It's expected to contain two space-separated numbers, N and K.
     * NK[0] will be N, NK[1] will be K.
     */
    const   NK   =   input[0].split ( ' ' )
                               .map (   n   =>   Number ( n )   )   ;

    // Initialize a counting bucket array.
    // Its size is N + 1, and all elements are initially 0.
    const   countBucket   =   [ ...Array ( NK[0] + 1 ) ]
                                    .fill ( 0 )   ;

    // Process the second line of input.
    // 1. Split by spaces.
    // 2. Convert each part to a number.
    // 3. Increment the count in countBucket for each number.
    // 4. Slice the countBucket array starting from index K.
    // 5. Reduce the sliced array to calculate the sum of its elements.
    const   answer   =   input[1].split ( ' ' )
                                   .map (   n   =>   Number ( n )   )
                                   .forEach (   n   =>   countBucket[n]  +=  1   )
                                   .slice ( NK[1] )
                                   .reduce (   (   a ,   b   )   =>   a  +  b   )   ;

    // Output the final calculated answer to the console.
    console.log (   answer   )   ;

} // End of the main function definition.


// --- Program Entry Point ---
// Read input from standard input, typically /dev/stdin in competitive programming environments.
// The input is read as a UTF-8 string.
// Then, call the main function with the obtained input.
main (   require ( 'fs' )
             .readFileSync ( '/dev/stdin' ,   'utf8' )   )   ;