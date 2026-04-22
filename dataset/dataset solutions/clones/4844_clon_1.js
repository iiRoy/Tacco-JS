"use strict"; /*
 * This is a strict mode declaration.
 * It helps in writing cleaner and safer JavaScript code.
 */


const main = ( arg ) => { // The main function definition starts here.
    // First, process the input argument: trim whitespace and split into lines.
    arg = arg.trim() . split( "\n" );

    // Parse the first line of the input to extract N and X.
    // N is the first number, X is the second.
    const N = parseInt( arg[0].split( " " ) [0] );
    const X = parseInt( arg[0].split( " " ) [1] );

    /*
     * The second line of input contains an array of numbers.
     * Split by spaces and convert each part to an integer.
     */
    const A = arg[1].split(" ") . map ( n => parseInt(n) );
    let cnt = 0; // Initialize a counter variable. This will store the total reduction.


    // Iterate through the array A, considering pairs of adjacent elements.
    // The loop runs from the first element up to the second-to-last element.
    for ( let i = 0 ; i < N - 1 ; i ++ ) {

        // Calculate the sum of the current element and the next element.
        let sum = A[i] + A[i + 1] ;

        // Check if the calculated sum exceeds the threshold X.
        if ( sum > X ) {
            // If the sum is greater than X, we need to reduce the elements.
            // The reduction primarily happens on A[i+1].
            // The amount to reduce is (sum - X).
            // A[i+1] is set to the maximum of 0 and its current value minus the reduction.
            A[i + 1] = Math.max( 0 , A[i+1] - ( sum - X ) ) ;

            // Add the amount of reduction to the total counter.
            cnt += sum - X ;
        }
    }

    // Finally, print the accumulated count to the console.
    console.log( cnt ) ;
};


// This line reads the input from standard input (e.g., a piped file or console input),
// converts it to a UTF-8 string, and then passes it to the 'main' function for processing.
main( require('fs').readFileSync('/dev/stdin', 'utf8') );