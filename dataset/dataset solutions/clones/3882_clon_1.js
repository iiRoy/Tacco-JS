/* This is a Type I clone of the original JavaScript code.
   The primary goal is to maintain exact logical and structural equivalence
   while introducing significant variations in whitespace and comments.
   No changes to variable names, function names, operators, or expressions
   are permitted under the Type I definition. */

'use strict'; // Enforce strict mode for better code quality and error handling.

function Main ( input ) {
    // --- Input Processing Section ---

    // Process the raw input string:
    // 1. Trim leading/trailing whitespace.
    // 2. Split the string by one or more whitespace characters.
    // 3. Convert each resulting string part into a number.
    input = input
              .trim()
              .split( /\s+/ )
              .map( x => x - 0 );


    var N = input.shift(); // N: Represents the total number of items or points.
    var C = input.shift(); // C: Represents a capacity, total length, or a reference point.


    // --- Array Initialization and Population ---

    // A note about the problem's context:
    // Regardless of whether considering clockwise or counter-clockwise movement,
    // the sushi items (or points) are consistently numbered in a counter-clockwise direction.

    var X = [ input[0] ]; // X: Array to store the 'distance' for each item.
    var V = [ input[1] ]; // V: Array to store the 'cumulative value' (e.g., calories) up to each item.

    // Populate the X and V arrays based on the remaining input data.
    // The input format implies pairs of (distance, value) for each item.
    for ( let i = 1;
          i < N;
          i ++ )
    {
        X[ i ] = input[ 2 * i ]; // The distance for the current item 'i'.
        V[ i ] = V[ i - 1 ] + input[ ( 2 * i ) + 1 ]; // Cumulative value for item 'i' by adding its value to the previous cumulative total.
    }


    // --- Inverse Arrays Calculation ---

    // Initialize arrays for 'inverse' calculations, often used for movements in the opposite direction.
    var iX = [ C - input[0] ]; // iX: Inverse distance, typically C minus the item's distance.
    var iV = [ V[ N - 1 ] ];   // iV: Inverse cumulative value, starting from the total value.

    // Populate the inverse arrays by iterating backwards from N-1 down to 1.
    for ( let i = N - 1;
          i > 0;
          i -- )
    {
        iX[ i ] = C - X[ i ];           // Calculate the inverse distance for item 'i'.
        iV[ i ] = V[ N - 1 ] - V[ i - 1 ]; // Calculate the inverse cumulative value for item 'i'.
    }


    // --- Profit Calculation (R and iR) ---

    // R: Represents the 'profit' (value minus distance) for a clockwise traversal.
    var R = V.map( ( x, i ) => x - X[ i ] );

    // iR: Represents the 'profit' for a counter-clockwise traversal.
    var iR = iV.map( ( x, i ) => x - iX[ i ] );

    // Original debug logging for R and iR has been removed to meet Type I cloning criteria.
    // console.log( R, iR );


    // --- Maximum Profit Sub-array Calculations (Rmax and iRmax) ---

    // Rmax: Stores the maximum profit encountered *up to* the current point 'i' in a clockwise direction.
    var Rmax = R.map( ( x, i, a ) => ( x < a[ i - 1 ] ) ? a[ i - 1 ] : x );

    // iRmax: Stores the maximum profit encountered *from* the current point 'i' backwards in a counter-clockwise direction.
    var iRmax = [];
    iRmax[ N - 1 ] = iR[ N - 1 ]; // The last element's maximum is simply its own value.

    // Iterate backwards to compute iRmax: each element is the max of itself or the next element's max.
    for ( let i = N - 2;
          i >= 0;
          i -- )
    {
        iRmax[ i ] = Math.max( iR[ i ], iRmax[ i + 1 ] );
    }

    // Original debug logging for Rmax and iRmax has been removed.
    // console.log( Rmax, iRmax );


    // --- Combined Traversal Profit Calculations (RiR and iRR) ---

    // RiR: Represents profit from moving clockwise to 'i', then returning to '0' and moving counter-clockwise from '0' to some point 'j' (represented by iRmax[i+1]).
    var RiR = R.map( ( x, i ) => x - X[ i ] + iRmax[ i + 1 ] );
    // Special handling for the last element: if 'i' is N-1, there's no iRmax[N] so it's effectively 0.
    RiR[ N - 1 ] = R[ N - 1 ] - X[ N - 1 ] + 0; // The '+ 0' is kept for exact structural equivalence.

    // iRR: Represents profit from moving counter-clockwise to 'i', then returning to '0' and moving clockwise from '0' to some point 'j' (represented by Rmax[i-1]).
    var iRR = iR.map( ( x, i ) => x - iX[ i ] + Rmax[ i - 1 ] );
    // Special handling for the first element: effectively an impossible or invalid starting state with negative infinity.
    iRR[ 0 ] = -Infinity;


    // --- Final Result Aggregation and Output ---

    // Collect all calculated maximum profit scenarios into a single array for final comparison.
    var result = [
        Math.max.apply( null, Rmax ),   // Maximum profit from a purely clockwise traversal.
        Math.max.apply( null, iRmax ),  // Maximum profit from a purely counter-clockwise traversal.
        Math.max.apply( null, RiR ),    // Maximum profit from a clockwise then counter-clockwise traversal.
        Math.max.apply( null, iRR ),    // Maximum profit from a counter-clockwise then clockwise traversal.
        0, // Represents the case of not moving at all (zero profit).
    ];

    // Output the overall maximum profit found among all scenarios.
    console.log( Math.max.apply( null, result ) );

} // End of the Main function definition.


/*
 * This section handles the execution of the Main function.
 * It reads input from the standard input stream (typically '/dev/stdin' in competitive programming environments)
 * using Node.js's built-in 'fs' (file system) module, ensuring the input is interpreted as UTF-8.
 */
Main(
    require( 'fs' )
        .readFileSync( '/dev/stdin', 'utf8' )
);