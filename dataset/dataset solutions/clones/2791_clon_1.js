/*
 * This JavaScript file implements a solution for a specific problem
 * involving combinations and modular arithmetic. It reads input
 * from stdin, performs calculations, and prints the result to stdout.
 */
'use strict'; // Enable strict mode for better error handling and cleaner code.


( function ( input ) {
    // Step 1: Process the raw input string.
    // - Trim leading/trailing whitespace.
    // - Split the string into an array of substrings using one or more whitespace characters as delimiters.
    // - Map each substring to a number (the `x - 0` trick is a concise way to convert string to number).
    input = input.trim().split( /\s+/ ).map( x => x - 0 );

    // Step 2: Extract key parameters from the processed input array.
    const N = input[0], // The first number in the input, typically representing a total count.
          K = input[1], // The second number, often a selection count.
          L = N - K + 1, // A derived parameter, possibly related to a sub-problem size.
          M = ( 1e9 + 7 ); // A large prime number used as a modulus for arithmetic operations (10^9 + 7).

    /**
     * Helper function to perform modular addition.
     * Ensures that the result stays within the range [0, M-1].
     * @param {number} a - The first operand.
     * @param {number} b - The second operand.
     * @returns {number} The modular sum (a + b) % M.
     */
    function sum( a, b ) {
        return ( a + b ) % M;
    }

    /**
     * Helper function to perform modular multiplication for potentially large numbers.
     * It uses a "splitting" technique (similar to Karatsuba or schoolbook multiplication)
     * to prevent intermediate products from overflowing standard JavaScript number limits
     * before the modulo operation, especially when M is large.
     * The numbers are split into components based on powers of 2^9 (512).
     *
     * @param {number} a - The first multiplier.
     * @param {number} b - The second multiplier.
     * @returns {number} The modular product (a * b) % M.
     */
    function mult( a, b ) {
        // Decompose 'a' into three parts (a3, a2, a1) based on a base of 2^9.
        // a = a1 * (2^18) + a2 * (2^9) + a3
        let a1 = ( a >> 18 ), // a divided by 2^18 (integer division)
            a2 = ( a >> 9 ) - ( a1 << 9 ), // (a divided by 2^9) modulo 2^9
            a3 = a - ( a1 << 18 ) - ( a2 << 9 ), // a modulo 2^9
            A = [ a3, a2, a1 ]; // Array representation of 'a' in base 2^9

        // Decompose 'b' into three similar parts (b3, b2, b1).
        let b1 = ( b >> 18 ),
            b2 = ( b >> 9 ) - ( b1 << 9 ),
            b3 = b - ( b1 << 18 ) - ( b2 << 9 ),
            B = [ b3, b2, b1 ]; // Array representation of 'b' in base 2^9

        let r = 0; // Initialize the result accumulator for the modular product.

        // Perform a multiplication similar to long multiplication, but with base 2^9 components.
        // Each partial product (A[i] * B[j]) needs to be shifted by (i+j) * 9 bits.
        for ( let i = 0; i < 3; i++ ) {
            for ( let j = 0; j < 3; j++ ) {
                // Calculate the product of two components and take modulo M.
                let m = ( A[i] * B[j] ) % M;

                // Apply the necessary "shift" by multiplying by (2^9) `i+j` times.
                // This corresponds to the power of the base (2^9) for this partial product.
                for ( let k = 0; k < i + j; k++ ) {
                    m = ( m * ( 1 << 9 ) ) % M; // Equivalent to m * 512 % M
                }
                // Add this adjusted partial product to the running total 'r' using modular addition.
                r = sum( r, m );
            }
        }
        return r; // Return the final modular product.
    }


    // Step 3: Pre-compute combinations (nCr) modulo M using dynamic programming (Pascal's Triangle).
    // `combination[n][k]` will store (n choose k) % M.
    // Initialize a 2D array where `combination[n]` is an array of size `n+1`.
    const combination = new Array( N + 1 )
        .fill( 0 ) // Fill with placeholders (not strictly necessary but common practice)
        .map( ( zero, n ) => new Array( n + 1 ).fill( 1 ) ); // Initialize C(n, 0) and C(n, n) to 1.

    // Populate the combination table.
    // The recurrence relation is C(n, k) = C(n-1, k-1) + C(n-1, k).
    // Base cases: C(n, 0) = 1 and C(n, n) = 1 are already handled by the initialization.
    for ( let n = 2; n < N + 1; n++ ) {
        for ( let k = 1; k < n; k++ ) {
            combination[n][k] = sum( combination[n - 1][k - 1], combination[n - 1][k] );
        }
    }


    // Step 4: Calculate the required answers based on the problem's formula.
    const ans = []; // Array to store the final computed results.

    // Iterate 'K' times to compute each element of the answer.
    for ( let I = 0; I < K; I++ ) {
        let i = I + 1; // Convert 0-based loop index 'I' to 1-based 'i' for problem logic.

        // The problem requires calculating a product of two combinations:
        // (L choose i) * (K-1 choose i-1) all modulo M.
        ans.push( mult( combination[L][i], combination[K - 1][i - 1] ) );
    }


    // Step 5: Output the results.
    // Join all elements in the 'ans' array with newline characters and print to console.
    console.log( ans.join( '\n' ) );

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ); // Immediately-invoked function expression (IIFE)
                                                              // to read input from standard input (/dev/stdin)
                                                              // and pass it to the main logic.