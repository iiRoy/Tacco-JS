'use strict'; // This directive enforces strict parsing and error handling in the script.

// This is the primary function that processes the input data
// and computes the required output based on the problem's logic.
function main( input ) {

    // First, we split the entire input string by newline characters
    // to get an array where each element represents a line of input.
    const lines = input .split( '\n' );

    // The first line of input contains the integer N.
    // We parse it and remove it from the 'lines' array using shift().
    const N = parseInt( lines .shift() );

    // We initialize an empty array named F.
    // This array will store the first N rows of data from the input.
    const F = [];
    // Loop N times to populate the F array.
    for ( let i = 0; i < N; i++ ) {
        // For each of the next N lines, we split it by spaces,
        // then map each resulting string to an integer, and push
        // this array of integers into F.
        F .push( lines[ i ] .split( ' ' ) .map( x => parseInt( x ) ) );
    }

    // Similarly, we initialize another empty array named P.
    // This array will store the subsequent N rows of data.
    const P = [];
    // Loop N times again to populate the P array.
    // Note that the indices for 'lines' are offset by N here.
    for ( let i = 0; i < N; i++ ) {
        // We perform the same splitting and parsing operation as for F,
        // but using lines starting from index N in the original 'lines' array.
        P .push( lines[ i + N ] .split( ' ' ) .map( x => parseInt( x ) ) );
    }

    // Initialize 'result' to negative infinity.
    // This variable will hold the maximum score found.
    let result = -Infinity;

    // This loop iterates through all possible combinations of stores.
    // The problem implies there are 10 possible stores, so 2^10 = 1024 combinations.
    // We start from 1 because a combination of all zeros (no stores open) might not be relevant,
    // or handled implicitly by the problem constraints.
    for ( let i = 1; i < 1024; i++ ) {

        // Initialize 'score' for the current combination 'i'.
        // This will accumulate the total score for this specific combination.
        let score = 0;

        // This inner loop iterates through each of the N entries in F (and implicitly P).
        for ( let j = 0; j < N; j++ ) {
            // 'store' refers to the j-th row in F, representing availability across 10 stores.
            let store = F[ j ];

            // This is a crucial and complex calculation for 'p_index'.
            // 1. `store.join('')`: Concatenates the elements of 'store' (e.g., [1,0,1] becomes "101").
            // 2. `parseInt(..., 2)`: Parses this string as a binary number.
            // 3. `& i`: Performs a bitwise AND operation with the current combination 'i'.
            //    This effectively filters the store's availability by the combination 'i'.
            // 4. `.toString(2)`: Converts the result back to a binary string.
            // 5. `.split('')`: Splits the binary string into an array of characters ('0' or '1').
            // 6. `.map(x => Number(x))`: Converts each character to a number (0 or 1).
            // 7. `.reduce((a,b) => a+b, 0)`: Sums these numbers, effectively counting the set bits (1s).
            //    This count is the 'p_index' used to access the P array.
            let p_index = (
                parseInt( store .join( '' ), 2 ) & i
            )
            .toString( 2 )
            .split( '' )
            .map( x => Number( x ) )
            .reduce( ( a, b ) => a + b, 0 );

            // Add the value from P at the calculated 'p_index' to the current 'score'.
            score += P[ j ][ p_index ];
        }

        // After calculating the score for the current combination 'i',
        // we check if it's greater than the maximum 'result' found so far.
        if ( score > result ) {
            // If it is, update 'result' with this new maximum score.
            result = score;
        }
    }

    // Finally, print the maximum calculated score to the console.
    console .log( result );

} // End of the 'main' function.


// This line is responsible for reading the input from standard input (stdin)
// and passing it to the 'main' function for processing.
// 'fs.readFileSync' reads the file synchronously, and 'utf8' specifies the encoding.
main( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) );