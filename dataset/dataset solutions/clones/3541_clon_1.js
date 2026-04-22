/* This JavaScript file is designed to solve a specific algorithmic problem.
 * It reads numerical data from input, performs complex cost calculations,
 * and then outputs the final aggregated cost.
 * The 'use strict' directive ensures modern, safer JavaScript behavior.
 */
'use strict' ;


// The primary function that encapsulates the problem's logic.
const main = ( input ) => {

    // First, split the entire input string into an array of lines.
    const l = input.split( '\n' );

    // The first line (l[0]) contains two space-separated values, N and X.
    const l0 = l[0].split( ' ' );

    // Parse N as an integer, representing the number of items.
    const N = parseInt( l0[0], 10 );
    // Parse X as an integer, a constant factor used in cost computations.
    const X = parseInt( l0[1], 10 );

    // The second line (l[1]) contains a list of item values.
    // Split these values by space and take only the first N elements.
    const l1 = l[1].split( ' ' ).slice( 0, N );

    let cost = 0; // Initialize the total accumulated cost to zero.

    // Begin iterating from the last element of the array 'l1' backwards.
    let i = N - 1;
    while ( i >= 0 ) {
        // Add the base cost for the current item 'i'.
        cost += 5 * l1[i] + 2 * X;

        let k = 1; // Initialize a counter for the inner optimization loop.

        // Inner loop: attempts to optimize cost by grouping previous items with the current one.
        while ( i - k >= 0 ) {
            const l1k = l1[i - k]; // Get the value of the item at index (i - k).

            // Calculate the 'defaultCost' if item (i-k) were processed independently.
            const defaultCost = 5 * l1k + 2 * X;

            // This line shows a previous, more complex form of 'testCost' calculation.
            // let testCost = (k + 2) * (k + 2) * l1k - (k + 1) * (k + 1) * l1k + X;
            // The simplified 'testCost' for grouping item (i-k) with the current segment.
            const testCost = ( 2 * k + 3 ) * l1k + X;

            // Compare the default individual cost with the optimized grouped cost.
            if ( defaultCost < testCost ) {
                // If processing individually is cheaper, then stop grouping.
                break;
            } else {
                // If grouping is cheaper or equal, add the optimized cost to the total.
                cost += testCost;
                k++; // Increment 'k' to consider the next preceding item for grouping.
            }
        }
        // After the inner loop, advance 'i' by 'k' steps, effectively skipping items that were grouped.
        i -= k;
    }
    // Output the final calculated total cost to the console.
    console.log( cost );
}; // End of the 'main' function definition.


// A boolean flag to control whether the script runs with hardcoded test cases or real input.
const isTest = false;


// Conditional block to execute either test cases or read from standard input.
if ( isTest ) {
    // Execute 'main' with various predefined test inputs for debugging/verification.
    main( '2 100\n1 10' );
    main( '5 1\n1 999999997 999999998 999999999 1000000000' );
    main( '10 8851025\n38 87 668 3175 22601 65499 90236 790604 4290609 4894746' );
    main( '16 10\n1 7 12 27 52 75 731 13856 395504 534840 1276551 2356789 9384806 19108104 82684732 535447408' );
} else {
    // In a production environment, read the input from '/dev/stdin' (standard input).
    main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );
}
// This marks the end of the script's execution flow.