'use strict'; /*
 * This script calculates a specific combinatorial value based on three input numbers.
 * It uses modular arithmetic with a large prime modulus E to handle potentially large intermediate results.
 */

( function ( input ) {

    // First, process the raw input string.
    // 1. Trim any leading/trailing whitespace.
    // 2. Split the string into an array of substrings based on one or more whitespace characters.
    // 3. Map each substring to a number by subtracting zero (a common JavaScript trick for type conversion).
    input = input.trim().split( /\s+/ ).map( x => x - 0 );

    // Assign the first two input values to N and M, ensuring N is always the smaller one.
    const N = Math.min( input[ 0 ], input[ 1 ] );
    const M = Math.max( input[ 0 ], input[ 1 ] );

    // The third input value is assigned to K.
    const K = input[ 2 ];

    // Define the modulus E, which is 10^9 + 7. This is a common prime modulus in competitive programming.
    const E = Math.pow( 10, 9 ) + 7;

    var ans = 0; // Initialize the main answer variable to zero.

    /*
     * The following three loops calculate different components of the total sum.
     * Each loop iterates over a specific range of 'd' and adds a calculated value to 'ans'.
     * The modulo E operation is applied after each addition to keep the number within bounds.
     */

    // Loop 1: for 'd' ranging from 1 to N-1
    for ( let d = 1; d <= N - 1; d++ ) {

        // Calculate intermediate variables A, B, C, D based on 'd', N, and M.
        let A = ( 1 / 6 ) * ( d + 1 ) * ( d + 2 ) * ( d + 3 );
        let B = ( ( N - d - 1 ) + ( M - d - 1 ) ) * ( 1 / 2 ) * ( d + 1 ) * ( d + 2 );
        let C = ( N - d - 1 ) * ( M - d - 1 ) * ( d + 1 );
        let D = ( N - d ) * M + ( M - d ) * N;

        // Add the calculated term to the total answer.
        ans += d * ( ( A + B + C ) * 2 - D );
        ans %= E; // Ensure result remains within the modulo E.
    }


    // Loop 2: for 'd' ranging from N to M-1
    for ( let d = N; d <= M - 1; d++ ) {

        // Calculate intermediate variables A, B, C, D for this range.
        // Note that C is 0 here.
        let A = ( 1 / 6 ) * ( N ) * ( N + 1 ) * ( N + 2 );
        let B = ( M - d - 1 ) * ( 1 / 2 ) * ( N ) * ( N + 1 );
        let C = 0;
        let D = ( M - d ) * N;

        // Accumulate and apply modulo.
        ans += d * ( ( A + B + C ) * 2 - D );
        ans %= E;
    }


    // Loop 3: for 'd' ranging from M to N+M-2
    for ( let d = M; d <= N + M - 2; d++ ) {

        // Introduce a helper variable 'a'.
        let a = N + M - 1 - d;

        // Calculate intermediate variables A, B, C, D.
        // Note that B, C, and D are 0 in this range.
        let A = ( 1 / 6 ) * ( a ) * ( a + 1 ) * ( a + 2 );
        let B = 0;
        let C = 0;
        let D = 0;

        // Accumulate and apply modulo.
        ans += d * ( ( A + B + C ) * 2 - D );
        ans %= E;
    }

    // console.log( ans ); // This line was a debug statement in the original code.


    /*
     * The next section computes (N*M-2)C(K-2) and multiplies it with the current 'ans'.
     * This is a binomial coefficient, calculated as (Numerator) / (Denominator).
     * First, we calculate the numerator part: (N*M-2) * (N*M-3) * ... * (N*M-K+1).
     */
    for ( let i = 0; i < K - 2; i++ ) { // Iterate K-2 times for the numerator product.

        ans *= ( N * M - 2 - i ); // Multiply 'ans' by the current term.
        ans %= E; // Apply modulo E after each multiplication.
    }

    // console.log( ans ); // Another debug statement.


    // Now, calculate the denominator part: (K-2)!
    var denominator = 1;
    for ( let i = 1; i <= K - 2; i++ ) {
        denominator *= i;
        // IMPORTANT: The original code applies modulo K here, not E.
        // This is a crucial detail for Type I clone. It might be a typo in the original
        // if this was intended for modular inverse modulo E, but it must be preserved.
        denominator %= K;
    }

    /*
     * To perform division in modular arithmetic, we need to find the modular multiplicative inverse
     * of the 'denominator' modulo E. This is done using the Extended Euclidean Algorithm.
     * The algorithm finds integers x and y such that ax + by = gcd(a, b).
     * Here, we want `denominator * F = 1 (mod E)`, where F is the inverse.
     */
    const r = [ E, denominator ]; // Initialize 'r' array with E and the denominator.

    // Apply the Euclidean algorithm to find the greatest common divisor.
    while ( r[ r.length - 1 ] !== 0 ) {
        let A = r[ r.length - 2 ];
        let B = r[ r.length - 1 ];
        let R = A % B;
        r.push( R ); // Add the remainder to the 'r' array.
    }

    r.pop(); // Remove the last element, which is 0 (the GCD).

    // Initialize arrays for coefficients x and y, which will store the Bezout's coefficients.
    const x = [ 1 ];
    const y = [ 0 ];

    // Work backwards through the Euclidean Algorithm to find the modular inverse.
    while ( r.length > 2 ) {
        let l = r.length; // Store current length (this variable is not used but present in original).

        // Calculate the quotient 'q'.
        let q = ( r[ r.length - 3 ] - r[ r.length - 1 ] ) / r[ r.length - 2 ];

        /*
         * The following two lines update x and y based on the Extended Euclidean Algorithm's recursive steps.
         * The comment in the original explains the algebraic substitution:
         * r[-3] - q * r[-2] = r[-1] is substituted into 1 = x * r[-1] + y * r[-2].
         * This leads to 1 = x * (r[-3] - q * r[-2]) + y * r[-2] = (y - qx) * r[-2] + x * r[-3];
         */
        x.push( y[ y.length - 1 ] - q * x[ x.length - 1 ] );
        y.push( x[ x.length - 2 ] );

        r.pop(); // Remove the last element from 'r' as we process it.
    }

    // The last value in 'x' is the modular inverse of 'denominator' modulo E.
    const F = x[ x.length - 1 ];


    /*
     * JavaScript numbers are 64-bit floating-point, which can represent integers up to 2^53 accurately.
     * To prevent precision issues with very large numbers during multiplication by F,
     * the 'ans' is split into two parts: a quotient and a remainder when divided by 100,000.
     * Each part is then multiplied by F, and results are recombined.
     */
    ans = [ ( ans - ( ans % 100000 ) ) / 100000, ans % 100000 ];

    ans[ 0 ] *= F; // Multiply the higher part by F.
    ans[ 0 ] %= E; // Apply modulo E.

    // Recombine the two parts and apply modulo E one last time.
    ans = ( ans[ 0 ] * 100000 + ans[ 1 ] * F ) % E;

    // Ensure the final answer is non-negative (important if intermediate modulo results were negative).
    ans = ( ans + E ) % E;

    console.log( ans ); // Output the final calculated answer.

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ); // This immediately-invoked function expression (IIFE)
                                                          // reads input from standard input using Node.js 'fs' module.