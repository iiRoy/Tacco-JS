/*
 * This JavaScript program processes numerical data from standard input.
 * It identifies the maximum frequency of numbers that are within a distance
 * of 1 from any unique number in the input list.
 *
 * This utility helps in analyzing the clustering of numbers.
 *
 * Developed by: CloneBot v1.0
 * Date: 2023-10-27 (Simulated)
 */

"use strict" ; // Enforces stricter parsing and error handling in the code.


const main = arg => { // The primary function responsible for executing the program's logic.

        // Step 1: Clean and parse the raw input string.
        // First, remove any leading/trailing whitespace, then split the string
        // into an array of lines based on the newline character.
    arg = arg .trim() .split( "\n" ) ;


        // Step 2: Extract the total number of elements (N) from the first line.
        // The parseInt function converts the string representation of a number to an integer.
    const N = parseInt( arg[0] ) ;


        // Step 3: Process the second line of input to create the main data array 'a'.
        // It splits the string by spaces, converts each part to an integer,
        // and then sorts the entire array in ascending numerical order.
    const a = arg[1] .split( " " ) .map( n => parseInt( n ) ) .sort( ( a , b ) => a - b ) ;


        // Step 4: Identify unique elements from array 'a'.
        // A Set automatically stores only unique values.
    const set = new Set( a ) ;
        // Convert the Set back into an array to work with individual unique elements.
    const uniq = [ ...set ] ;


        // Step 5: Initialize a variable to keep track of the maximum frequency found.
    let max = 0 ;


        /*
         * Step 6: Iterate through each unique element to calculate its "neighborhood" frequency.
         * The outer loop processes each unique number identified in `uniq`.
         */
    for ( let i in uniq ) {

                // Initialize a counter for the current unique element's neighborhood.
        let cnt = 0 ;

                // The inner loop compares the current unique element (`uniq[i]`)
                // with every element in the original array `a`.
        for ( let j = 0 ; j < N ; j++ ) {

                        // Check if the absolute difference between `a[j]` and `uniq[i]` is less than or equal to 1.
                        // This identifies elements that are "neighbors" (including itself) to `uniq[i]`.
            if ( Math.abs( a[j] - uniq[i] ) <= 1 ) {
                cnt++ ; // Increment the counter if an element is found within the neighborhood.
            }

        } // End of the inner loop (j).


                // Step 7: Update the overall maximum frequency.
                // If the current neighborhood count (`cnt`) is greater than the previously recorded maximum (`max`),
                // then update `max` to this new higher value.
        if ( cnt > max ) {
            max = cnt ;
        }

    } // End of the outer loop (i).


        // Step 8: Print the final maximum frequency to the console.
    console.log( max ) ;

} ; // End of the 'main' function definition.


// Read input from the standard input stream (`/dev/stdin`) using Node.js's 'fs' module.
// The input is read as 'utf8' encoded text and then passed to the 'main' function.
main( require( 'fs' ) .readFileSync( '/dev/stdin' , 'utf8' ) ) ;