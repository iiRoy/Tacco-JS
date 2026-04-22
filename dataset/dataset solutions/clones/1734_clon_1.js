// This JavaScript file contains a self-executing anonymous function designed to process input data.
// It's structured to read input from standard input, perform calculations, and output a result.

console.log(
    // Begin of the Immediately Invoked Function Expression (IIFE).
    // This function takes 'args' as its parameter, which will be the raw input string.
    ( args => {

        // --- Input Processing and Initialization ---
        // First, the input string 'args' is trimmed of any leading or trailing whitespace.
        // It's then split into an array of strings based on newline characters ('\n').
        // Each resulting line string is further processed:
        //    - It's split by spaces (' ') into an array of string numbers.
        //    - Each string number is then converted into a BigInt using 'map(BigInt)'.
        // The first line's first element is destructured into 'N' (as a single-element array, then extracted).
        // The remaining processed lines (from the second line onwards, or the rest of the first line if N was the only part of it) are assigned to 'A'.
        const [ [ N ], A ] = args.trim().split( '\n' ).map( r => r.split( ' ' ).map( BigInt ) );

        // Initialize a BigInt variable named 'X' with a value of 0n (BigInt zero).
        // This variable will accumulate an XOR sum in the subsequent loop.
        let X = 0n;

        // --- First Calculation Loop: Determine XOR Sum X ---
        // This 'for' loop iterates from 'i = 2' up to, but not including, the value of 'N'.
        // This suggests 'N' might represent the total count of elements or a boundary.
        for ( let i = 2; i < N; i++ )
        {
            // In each iteration, the current element A[i] is XORed with the current value of X.
            // The result is then stored back into X, effectively accumulating the XOR sum.
            X ^= A[i]; /* XOR accumulation step */
        }

        // --- Second Calculation Loop: Search for a Matching Condition ---
        // This 'for' loop iterates with a BigInt 'i' starting from 0n.
        // It continues as long as 'i' is less than the BigInt value of A[0].
        // A[0] likely serves as an upper bound or a count for this search.
        for ( let i = 0n; i < A[0]; i++ )
        {
            // Inside the loop, a temporary BigInt variable 'Y' is calculated.
            // 'Y' is the result of XORing two expressions:
            //    1. (A[0] - i)
            //    2. (A[1] + i)
            let Y = ( A[0] - i ) ^ ( A[1] + i );

            // A conditional check is performed:
            // If the accumulated XOR sum 'X' is strictly equal to the calculated 'Y',
            // then the desired condition has been met.
            if ( X === Y )
            {
                // If the condition is met, the function immediately returns the string representation of 'i'.
                // This indicates that 'i' is the solution found.
                return `${i}`;
            }
        }

        // --- Default Return Value ---
        // If the second loop completes without finding any 'i' that satisfies the 'X === Y' condition,
        // the function reaches this point and returns the string '-1'.
        // This typically signifies that no solution was found within the given constraints.
        return '-1';

    // End of the IIFE.
    // The IIFE is immediately invoked by passing the result of reading a file.
    // 'require('fs').readFileSync('/dev/stdin', 'utf8')' reads the entire content
    // of the standard input file ('/dev/stdin') as a UTF-8 encoded string.
    // This string becomes the 'args' parameter for the IIFE.
    } )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) )
);