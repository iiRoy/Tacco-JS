'use strict'; // Enable strict mode for secure code execution.

/*
 * This JavaScript file contains a solution for a problem
 * that involves processing a list of items to find the minimum cost
 * under a certain time constraint.
 *
 * Author: Code Clone Generator
 * Date: Current Date (generated)
 */

const main = ( input ) => { // Define the main function that takes the raw input string.

    // First, split the entire input string into an array of lines.
    input = input.split( '\n' ) ;

    // The very first line of input contains two crucial numbers: N and T.
    // We parse them here.
    let temp = input[0] .split( ' ' ) .map( i => parseInt( i ) ) ;

    const N = temp[0] ; // N represents the total number of items to consider.
    const T = temp[1] ; // T is the time limit or threshold.

    // Now, extract only the lines that describe the items themselves.
    // These are from the second line up to the (N+1)-th line.
    temp = input.slice( 1, N + 1 ) ;

    let ans = 1001 ; // Initialize 'ans' with a value that is guaranteed to be higher
                     // than any valid cost, serving as an initial "infinity".

    // Iterate through each item entry in the 'temp' array.
    temp.forEach( t => {
        /*
         * For each item string 't', split it to get its cost and time.
         * Then, convert these string parts into integers.
         */
        let tmp = t.split( ' ' ) .map( i => parseInt( i ) ) ;

        let c = tmp[0] ; // 'c' holds the cost of the current item.
        let time = tmp[1] ; // 'time' holds the time taken by the current item.

        // Check if the current item meets both conditions:
        // 1. Its time is less than the allowed threshold 'T'.
        // 2. Its cost 'c' is less than the current minimum cost stored in 'ans'.
        if ( time < T  &&  c < ans ) {
            ans = c ; // If both conditions are true, update 'ans' with this new, lower cost.
        }
    } ) ; // End of forEach loop.

    // After processing all items, decide what to print to the console.
    if ( ans === 1001 ) { // If 'ans' is still its initial value, it means no valid item was found.
        console.log( 'TLE' ) ; // Output 'TLE' (Time Limit Exceeded or No Solution).
    } else {
        console.log( ans ) ; // Otherwise, print the minimum cost found.
    }

} ; // End of the main function definition.

/*
 * This part reads the input from standard input,
 * decodes it as UTF-8, and then calls the 'main' function
 * with the processed input string.
 */
main( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf-8' ) ) ;