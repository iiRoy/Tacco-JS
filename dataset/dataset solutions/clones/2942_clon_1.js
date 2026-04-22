/*
 * This JavaScript code calculates a specific combinatorial value modulo E.
 * It reads input from standard input, performs several calculations involving
 * sums over different ranges, and then applies modular inverse to perform division.
 *
 * This version is a Type I clone, meaning only whitespace and comments have been
 * altered from the original source. All logic, identifiers, operators, and
 * expressions remain precisely the same.
 */
'use strict' ; /* Enforces strict mode for cleaner code and fewer errors. */

( function ( input ) {
    // Process the input string: trim whitespace, split by any whitespace,
    // and convert each part to a number.
    input = input . trim ( ) . split ( / \s + / ) . map ( x => x - 0 ) ;

    // Determine N and M based on the first two input values, ensuring N <= M.
    const N = Math . min ( input [ 0 ] , input [ 1 ] ) ; // N is the smaller of the two.
    const M = Math . max ( input [ 0 ] , input [ 1 ] ) ; // M is the larger of the two.

    const K = input [ 2 ] ; // K is the third input value.

    // E is the modulo value, 10^9 + 7, a common prime used in competitive programming.
    const E = Math . pow ( 10 , 9 ) + 7 ;

    var ans = 0 ; // Initialize the answer accumulator.

    /*
     * First calculation phase: Loop for d from 1 to N-1.
     * This loop computes a sum based on specific formulas for A, B, C, and D.
     */
    for ( let d = 1 ; d <= N - 1 ; d ++ ) {
        // Calculate term A
        let A = ( 1 / 6 ) * ( d + 1 ) * ( d + 2 ) * ( d + 3 ) ;
        // Calculate term B
        let B = ( ( N - d - 1 ) + ( M - d - 1 ) ) * ( 1 / 2 ) * ( d + 1 ) * ( d + 2 ) ;
        // Calculate term C
        let C = ( N - d - 1 ) * ( M - d - 1 ) * ( d + 1 ) ;
        // Calculate term D
        let D = ( N - d ) * M + ( M - d ) * N ;

        // Add the current term to the total answer, ensuring modulo E at each step.
        ans += d * ( ( A + B + C ) * 2 - D ) ;
        ans %= E ; // Apply modulo E.
    }


    /*
     * Second calculation phase: Loop for d from N to M-1.
     * This section has different formulas for B, C, and D.
     */
    for ( let d = N ; d <= M - 1 ; d ++ ) {
        // Calculate term A for this phase.
        let A = ( 1 / 6 ) * ( N ) * ( N + 1 ) * ( N + 2 ) ;
        // Calculate term B for this phase.
        let B = ( M - d - 1 ) * ( 1 / 2 ) * ( N ) * ( N + 1 ) ;
        // Term C is zero in this phase.
        let C = 0 ;
        // Calculate term D for this phase.
        let D = ( M - d ) * N ;

        // Accumulate result and apply modulo.
        ans += d * ( ( A + B + C ) * 2 - D ) ;
        ans %= E ;
    }


    /*
     * Third calculation phase: Loop for d from M to N+M-2.
     * This phase simplifies the terms significantly.
     */
    for ( let d = M ; d <= N + M - 2 ; d ++ ) {
        // Helper variable 'a' for calculation.
        let a = N + M - 1 - d ;
        // Calculate term A for this phase.
        let A = ( 1 / 6 ) * ( a ) * ( a + 1 ) * ( a + 2 ) ;
        // Terms B, C, and D are all zero in this phase.
        let B = 0 ;
        let C = 0 ;
        let D = 0 ;

        // Accumulate result and apply modulo.
        ans += d * ( ( A + B + C ) * 2 - D ) ;
        ans %= E ;
    }
    // console.log("Answer after initial sums:", ans); // Debugging line, commented out.


    /*
     * Multiply 'ans' by (N*M - 2)C(K - 2)
     * This involves multiplying by the numerator (N*M - 2) * (N*M - 3) * ... * (N*M - K + 1)
     */
    for ( let i = 0 ; i < K - 2 ; i ++ ) { // Loop to calculate the numerator part.
        ans *= ( N * M - 2 - i ) ; // Multiply 'ans' by the current factor.
        ans %= E ; // Apply modulo E after each multiplication to prevent overflow.
    }
    // console.log("Answer after numerator multiplication:", ans); // Another commented debugging line.


    // Calculate the denominator: (K-2)!
    var denominator = 1 ; // Initialize denominator.
    for ( let i = 1 ; i <= K - 2 ; i ++ ) {
        denominator *= i ; // Multiply by i.
        denominator %= E ; // Apply modulo E.
    }

    /*
     * To divide 'ans' by 'denominator' modulo E, we use the Extended Euclidean Algorithm
     * to find the modular multiplicative inverse of 'denominator' modulo E.
     * The algorithm computes x such that (denominator * x) % E = 1.
     * Then, (ans / denominator) % E becomes (ans * x) % E.
     */
    const r = [ E , denominator ] ; // Initialize array 'r' for Euclidean algorithm.
    while ( r [ r . length - 1 ] !== 0 ) {
        let A = r [ r . length - 2 ] ; // Second to last element.
        let B = r [ r . length - 1 ] ; // Last element.
        let R = A % B ; // Remainder.
        r . push ( R ) ; // Add remainder to 'r'.
    }
    r . pop ( ) ; // Remove the last zero from 'r'.

    const x = [ 1 ] ; // Initialize coefficients for the inverse calculation.
    const y = [ 0 ] ;

    // Back-substitution phase of the Extended Euclidean Algorithm.
    while ( r . length > 2 ) {
        let l = r . length ; // Current length of 'r'. (Not strictly used, but was in original)
        // Calculate quotient 'q' from the Euclidean steps.
        let q = ( r [ r . length - 3 ] - r [ r . length - 1 ] ) / r [ r . length - 2 ] ;

        // The comments below explain the substitution process:
        // r[-3] - q * r[-2] = r[-1] is the Euclidean step.
        // We want 1 = x * r[-1] + y * r[-2].
        // Substitute r[-1]: 1 = x * (r[-3] - q * r[-2]) + y * r[-2]
        // 1 = x * r[-3] + (y - qx) * r[-2]
        // This means the new x' is (y - qx) and new y' is x.
        x . push ( y [ y . length - 1 ] - q * x [ x . length - 1 ] ) ;
        y . push ( x [ x . length - 2 ] ) ;
        r . pop ( ) ; // Remove the processed remainder.
    }
    // F is the modular multiplicative inverse of 'denominator' modulo E.
    const F = ( x [ x . length - 1 ] + E ) % E ; // Ensure F is positive.

    /*
     * Final calculation: multiply 'ans' by F (the modular inverse).
     * To avoid potential precision issues with large numbers in JavaScript (up to 2^53),
     * 'ans' is split into two parts: a quotient and a remainder when divided by 100000.
     * Each part is then multiplied by F and added back.
     */
    // Split 'ans' into two parts: ans[0] is (ans / 100000), ans[1] is (ans % 100000).
    ans = [ ( ans - ( ans % 100000 ) ) / 100000 , ( ans % 100000 ) ] ;

    // Multiply the higher part by F and apply modulo.
    ans [ 0 ] *= F ;
    ans [ 0 ] %= E ;
    ans [ 0 ] = ( ans [ 0 ] + E ) % E ; // Ensure positive result.
    ans [ 0 ] *= 100000 ; // Multiply back by 100000.
    ans [ 0 ] %= E ; // Apply modulo again.

    // Multiply the lower part by F and apply modulo.
    ans [ 1 ] = ( ans [ 1 ] * F ) % E ;

    // Combine the two parts and apply final modulo.
    ans = ( ans [ 0 ] + ans [ 1 ] ) % E ;
    ans = ( ans + E ) % E ; // Ensure the final answer is positive.

    console . log ( ans ) ; // Output the final calculated answer.

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
/* End of the immediately invoked function expression. */