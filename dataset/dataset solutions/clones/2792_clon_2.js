'use strict'; // Enforce strict parsing and error handling for better code quality.

( function ( dataStream ) { // Anonymous function to encapsulate scope and process provided input.

    // Process the raw input stream: trim spaces, split by any whitespace, and convert to numbers.
    let numericValues = dataStream
        .trim()
        .split( /\s+/ )
        .map( ( item ) => Number( item ) ); // Convert string items to numeric values.

    const
        mainCount = numericValues[ 0 ], // The primary count, often denoted as 'n'.
        groupLimit = numericValues[ 1 ], // The maximum group size or 'k'.
        subRangeLen = mainCount - groupLimit + 1, // Calculated length for a sub-range.
        primeMod = ( 1e9 + 7 ); // A large prime number used for modular arithmetic operations.

    /*
     * Custom function to perform modular addition.
     * Ensures results stay within the bounds of the prime modulus.
     */
    function modAdd( operandA , operandB ) {
        return ( operandA + operandB ) % primeMod;
    }

    /*
     * Custom function for modular multiplication, handling large numbers efficiently
     * by splitting them into 16-bit parts to avoid overflow before the final modulo.
     */
    function modMultiply( argX , argY ) {
        let
            highPartX = ( argX >>> 16 ), // Extract higher 16 bits of argX.
            highPartY = ( argY >>> 16 ), // Extract higher 16 bits of argY.
            lowPartX = argX - ( highPartX << 16 ), // Extract lower 16 bits of argX.
            lowPartY = argY - ( highPartY << 16 ), // Extract lower 16 bits of argY.

            // Calculate intermediate products and apply modulo at each step.
            term1 = ( ( ( ( ( highPartX * highPartY ) % primeMod ) << 16 ) % primeMod ) << 16 ) % primeMod,
            term2 = ( ( ( highPartX * lowPartY ) % primeMod ) << 16 ) % primeMod,
            term3 = ( ( ( lowPartX * highPartY ) % primeMod ) << 16 ) % primeMod,
            term4 = ( lowPartX * lowPartY ) % primeMod,

            // Sum up the intermediate terms, ensuring each addition is also modular.
            finalProduct = ( term1 + term2 + term3 + term4 ) % primeMod;
        return finalProduct; // Return the final modular product.
    }

    // Initialize a 2D array to store binomial coefficients (Pascal's triangle).
    // The dimensions are (mainCount + 1) x (rowIdx + 1) for each row.
    const binomCoeffs = new Array( mainCount + 1 )
        .fill( 0 )
        .map( ( _unused , rowIdx ) => new Array( rowIdx + 1 ).fill( 1 ) );

    // Populate Pascal's triangle using the recurrence relation C(n, k) = C(n-1, k-1) + C(n-1, k).
    for ( let rowIdx = 2 ; rowIdx < mainCount + 1 ; rowIdx++ ) {
        for ( let colIdx = 1 ; colIdx < rowIdx ; colIdx++ ) {
            binomCoeffs[ rowIdx ][ colIdx ] = modAdd( binomCoeffs[ rowIdx - 1 ][ colIdx - 1 ] ,
                                                      binomCoeffs[ rowIdx - 1 ][ colIdx ] );
        }
    }

    // Prepare an array to store the computed final sequence of values.
    const outputValues = [ ];

    // Iterate 'groupLimit' times to compute and store the required results.
    for ( let iterCount = 0 ; iterCount < groupLimit ; iterCount++ ) {
        let adjustedIndex = iterCount + 1; // Adjust the 0-based loop index for 1-based array access.
        // Calculate the product of two specific binomial coefficients using modular multiplication.
        outputValues.push( modMultiply( binomCoeffs[ subRangeLen ][ adjustedIndex ] ,
                                        binomCoeffs[ groupLimit - 1 ][ adjustedIndex - 1 ] ) );
    }

    // Print the final calculated values, each on a new line.
    console.log( outputValues.join( '\x0A' ) );

} ) ( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ); // Read input synchronously from standard input.