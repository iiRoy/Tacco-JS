'use strict';
// This JavaScript program calculates a specific value based on input numbers,
// utilizing modular arithmetic to handle potentially large intermediate results.
// It is structured as an Immediately Invoked Function Expression (IIFE).

( function ( input )
{
    // First, process the raw input string received from standard input.
    // This involves several steps:
    // 1. Remove any leading or trailing whitespace characters.
    // 2. Split the string into an array of substrings, using one or more
    //    whitespace characters as delimiters.
    // 3. Map each resulting string element to its numerical representation.
    //    The 'x => x - 0' idiom is a concise way to achieve type conversion to number.
    input = input.trim()
                 .split( /\s+/ )
                 .map( x => x - 0 );


    // Define key variables from the processed input array.
    // N will store the minimum of the first two input values.
    const N = Math.min( input[ 0 ], input[ 1 ] );

    // M will store the maximum of the first two input values.
    const M = Math.max( input[ 0 ], input[ 1 ] );

    // K is directly taken from the third input value.
    const K = input[ 2 ];


    // E is a large prime number used as the modulus for all arithmetic operations.
    // This is common in competitive programming to keep results within manageable bounds.
    const E = Math.pow( 10, 9 ) + 7;


    // Initialize the variable 'ans' which will accumulate the final result.
    var ans = 0;


    // --- Begin First Calculation Loop ---
    // This loop iterates with variable 'd' ranging from 1 up to (N - 1).
    for ( let d = 1; d <= N - 1; d++ )
    {
        // Calculate intermediate term A using 'd'.
        let A = ( 1 / 6 ) * ( d + 1 ) * ( d + 2 ) * ( d * 3 );

        // Calculate intermediate term B, which depends on N, M, and 'd'.
        let B = ( ( N - d - 1 ) + ( M - d - 1 ) ) * ( 1 / 2 ) * ( d + 1 ) * ( d + 2 );

        // Calculate intermediate term C, also dependent on N, M, and 'd'.
        let C = ( N - d - 1 ) * ( M - d - 1 ) * ( d + 1 );

        // Calculate intermediate term D, based on N, M, and 'd'.
        let D = ( N - d ) + ( M - d );

        // Update the 'ans' accumulator with the current iteration's contribution.
        // The formula for contribution is d * ((A + B + C) * 2 - D).
        ans += d * ( ( A + B + C ) * 2 - D );

        // Apply the modulo operation to 'ans' to keep it within the range [0, E-1].
        ans %= E;
    }


    // --- Begin Second Calculation Loop ---
    // This loop processes 'd' from N up to (M - 1).
    for ( let d = N; d <= M - 1; d++ )
    {
        // Calculate term A for this range; it primarily depends on N.
        let A = ( 1 / 6 ) * ( N ) * ( N + 1 ) * ( N + 2 );

        // Calculate term B, involving M, d, and N.
        let B = ( M - d - 1 ) * ( 1 / 2 ) * ( N ) * ( N + 1 );

        // Term C is explicitly zero in this segment of the calculation.
        let C = 0;

        // Calculate term D, which depends on M and d.
        let D = ( M - d );

        // Add the calculated value for this iteration to 'ans'.
        ans += d * ( ( A + B + C ) * 2 - D );

        // Ensure 'ans' remains modular with respect to E.
        ans %= E;
    }


    // --- Begin Third Calculation Loop ---
    // This final summation loop runs for 'd' from M up to (N + M - 2).
    for ( let d = M; d <= N + M - 2; d++ )
    {
        // An auxiliary variable 'a' is introduced for simplification.
        let a = N + M - 1 - d;

        // Calculate term A using the auxiliary variable 'a'.
        let A = ( 1 / 6 ) * ( a ) * ( a + 1 ) * ( a + 2 );

        // Terms B, C, and D are all set to zero for this specific range.
        let B = 0;
        let C = 0;
        let D = 0;

        // Accumulate the result for the current 'd'.
        ans += d * ( ( A + B + C ) * 2 - D );

        // Apply the modulo operator.
        ans %= E;
    }


    // This section applies a series of multiplications and modular divisions.
    // The original comment suggests it relates to (N*M-2)C(K-2), but the exact
    // implementation details below should be noted carefully.
    for ( let i = 0; i < K - 2; i++ )
    {
        // Multiply 'ans' by the term (N*M - 2 - K).
        // Note: This specific term is constant throughout the loop's iterations,
        // which might be an unusual characteristic for a binomial coefficient calculation.
        ans *= ( N * M - 2 - K );
        ans %= E;

        // --- Modular Inverse Calculation using the Extended Euclidean Algorithm ---
        // This block is designed to compute the modular multiplicative inverse of 'i' modulo E.
        // It effectively performs division by 'i' in modular arithmetic.
        // Critical note: For the first iteration (when i=0), this setup `let r=[E,i]`
        // will attempt to find the modular inverse of 0. This operation is undefined
        // and would typically lead to errors or unexpected behavior (e.g., division by zero
        // if E is not 1 and i is 0, the `while` loop condition `r[r.length-1]!==1`
        // would become `0!==1` which is true, then `A%B` for `E%0` would throw an error).
        let r = [ E, i ], q = []; // 'r' stores remainders, 'q' stores quotients.

        // Continue the Euclidean algorithm until the greatest common divisor (GCD) is 1.
        // This implies that 'i' and 'E' are coprime, which is a prerequisite for a modular inverse to exist.
        while ( r[ r.length - 1 ] !== 1 )
        {
            let A_val = r[ r.length - 2 ]; // The previous remainder.
            let B_val = r[ r.length - 1 ]; // The current remainder.
            let R_val = A_val % B_val;     // Calculate the new remainder.
            let Q_val = ( A_val - R_val ) / B_val; // Calculate the quotient.
            r.push( R_val );                // Store the new remainder.
            q.push( Q_val );                // Store the quotient.
        }

        // 'x' will hold the coefficients from Bezout's identity (x * E + y * i = gcd(E, i)).
        // We are interested in 'y', which is the modular inverse of 'i'.
        // Initialize 'x' with coefficients for the final step of the Euclidean algorithm.
        let x = [ -( q.pop() ), 1 ]; // x[0] corresponds to E, x[1] to i.

        // Back-substitute through the stored quotients to find the coefficients for E and i.
        while ( q.length > 0 )
        {
            x.push( x[ x.length - 2 ] - x[ x.length - 1 ] * q.pop() );
        }

        // The modular inverse of 'i' modulo E is given by x[x.length - 2].
        // Apply this inverse multiplication to 'ans'.
        ans = ( x[ x.length - 2 ] * ans ) % E;

        // In JavaScript, the '%' operator can return a negative result if the dividend is negative.
        // Ensure 'ans' is always positive by adding E if it's negative.
        if ( ans < 0 )
        {
            ans += E;
        }
    }


    // Finally, print the computed answer to the console.
    console.log( ans );

// The IIFE is immediately executed, with its 'input' parameter populated
// by reading the entire content of '/dev/stdin' as a UTF-8 string.
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );