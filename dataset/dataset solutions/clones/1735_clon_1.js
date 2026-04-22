console.log(
    /*
     * This is a Type I clone of the original JavaScript code.
     * It showcases extensive modifications to whitespace and comments,
     * while meticulously preserving the exact semantic structure
     * and every single identifier, operator, and expression.
     */
    ( args => { // Start of the immediately invoked function expression (IIFE)

        // Declare and initialize constants N and A by parsing the input `args`.
        // The input string is first trimmed, then split by newlines.
        // Each resulting line is further split by spaces, and then all elements
        // are converted to BigInt type.
        const [ [ N ], A ] = args
                                 .trim()          // Remove any leading or trailing whitespace.
                                 .split( '\n' )   // Split the input string into an array of lines.
                                 .map( r => r.split( ' ' ) // For each line, split it by spaces.
                                             .map( BigInt ) ); // Convert each resulting string part to a BigInt.

        // Begin the primary loop. This loop iterates from `1n` up to `A[0]` (inclusive).
        // `i` is declared using `let` to be block-scoped within the loop.
        for ( let i = 1n; i <= A[0]; i++ ) {

            // Initialize `X` with the XOR sum of `(A[0] - i)` and `(A[1] + i)`.
            // `X` will accumulate the XOR sum for the current iteration of `i`.
            let X = ( A[0] - i ) ^ ( A[1] + i );

            // This nested loop iterates through the remaining elements of array `A`,
            // starting from index 2, up to `N-1`.
            // `j` is the loop counter, also block-scoped.
            for ( let j = 2; j < N; j++ ) {

                // Perform an XOR operation between the current `X` and the element `A[j]`.
                // The result is stored back into `X`.
                X ^= A[j];
            }

            // After calculating the full XOR sum `X` for the current `i`,
            // check if `X` is falsy (i.e., BigInt(0)).
            if ( !X ) {
                // If `X` is BigInt(0), then we have found the desired `i`.
                // Convert `i` to a string using a template literal and return it.
                return `${i}`;
            }

        }

        // If the loop completes without finding any `i` that satisfies the condition,
        // return the string `'-1'` as specified by the problem.
        return '-1';

    } )(
        // This is the input source for the IIFE.
        // It reads the content of '/dev/stdin' (standard input) as a UTF-8 string.
        require( 'fs' )
             .readFileSync( '/dev/stdin', 'utf8' )
    ) // End of the IIFE call
); // End of console.log statement