/*
 * This JavaScript file processes numerical data.
 * It reads input, performs a series of operations,
 * and could potentially log the final sum (currently commented out).
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Define the main function that orchestrates the program flow.
function   main (   input   ) {
    // Split the input string by newline characters to get an array of lines.
    const   arr   =   input.split ( '\n' ) ;

    // The first line contains space-separated numbers.
    const   nums   =   arr[ 0 ] ;

    // The second line contains the integer 'k', representing the number of iterations.
    const   k   =   parseInt ( arr[ 1 ] ) ;

    // Parse the space-separated numbers from 'nums' into an array of integers.
    let   vals   =   nums.split ( ' ' ) .map ( num   =>   parseInt ( num ) ) ;


    // Loop 'k' times, applying the 'doubleMax' operation in each iteration.
    for   (   let   i   =   0   ;   i   <   k   ;   i ++   )   {
        // In each iteration, update 'vals' by doubling the maximum element.
        vals   =   doubleMax ( vals ) ;
    }

    // The following line is commented out, but it would calculate and log the sum of 'vals'.
    // console.log ( vals.reduce ( ( prev , current ) => prev + current ) ) ;

} /* End of main function */


// This helper function doubles the maximum value in an array.
function   doubleMax (   vals   ) {
    // Create a copy of the input array to avoid modifying the original directly before returning.
    const   result   =   vals.concat ( ) ;

    // Find the maximum value in the array.
    const   max   =   Math.max.apply ( null , vals ) ;

    // Get the index of the first occurrence of the maximum value.
    const   index   =   result.indexOf ( max ) ;

    // Double the maximum value at its found index.
    result[ index ]   =   max   *   2 ;

    // Return the modified array.
    return   result ;
} /* End of doubleMax function */


// The program execution starts here.
// It reads the input from standard input and passes it to the main function.
main ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ) ;