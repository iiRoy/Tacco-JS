/* This module demonstrates a dynamic programming solution
 * for a combinatorial problem involving item selections.
 */

var primeDivisor = 1000000007; // A large constant for ensuring results stay within bounds via modulo.

/**
 * Computes the quantity of distinct ways to reach a specific `targetSum`
 * using a collection of `itemValues`. This computation relies on
 * dynamic programming with prefix sum optimization.
 *
 * @param {number} itemCount   The total number of distinct items available.
 * @param {number} targetSum   The exact sum that needs to be achieved.
 * @param {number[]} itemValues An array where each element represents the value of an item.
 * @returns {number} The final count of combinations, adjusted by `primeDivisor`.
 */
function calculateCombinations ( itemCount, targetSum, itemValues )
{
    // If the target sum is zero, there is always precisely one method:
    // selecting no items.
    if ( targetSum === 0 ) {
        return 1;
    }

    // Initialize the primary DP array. `currentCounts[s]` will store
    // the number of ways to form sum 's' considering items processed up to this point.
    var currentCounts = new Array( targetSum + 1 ).fill( 0 );

    // Initialize a two-dimensional array for storing prefix sums.
    // `cumulativeSums[i][s]` will store the accumulated sum of `currentCounts`
    // from 0 up to 's' for the i-th item.
    var cumulativeSums = new Array( itemCount ).fill( 0 ).map( function ( placeholder ) {
        return new Array( targetSum + 1 ).fill( 0 );
    } );

    // Begin iterating through each individual item.
    for ( var currentElementIdx = 0; currentElementIdx < itemCount; ++currentElementIdx )
    {
        // For each item, iterate through every possible capacity or sum value.
        for ( var currentCapacity = 0; currentCapacity <= targetSum; ++currentCapacity )
        {
            // Special handling for the very first item (index 0).
            if ( currentElementIdx === 0 )
            {
                // If the current capacity is less than or equal to the first item's value,
                // there's 1 way (by including this item). Otherwise, 0 ways.
                currentCounts[ currentCapacity ] = currentCapacity <= itemValues[ currentElementIdx ] ? 1 : 0;

                // Update the prefix sum array for the first item.
                cumulativeSums[ currentElementIdx ][ currentCapacity ] = currentCapacity > 0
                    ? ( ( cumulativeSums[ currentElementIdx ][ currentCapacity - 1 ] + currentCounts[ currentCapacity ] ) % primeDivisor )
                    : ( currentCounts[ currentCapacity ] % primeDivisor );
            }
            // For all subsequent items.
            else
            {
                // Determine the lower bound for the prefix sum subtraction.
                // This corresponds to `j - A[i] - 1` in the original logic.
                var previousSumIndex = currentCapacity - itemValues[ currentElementIdx ] - 1;

                if ( previousSumIndex >= 0 )
                {
                    // Calculate `dp[j]` using prefix sums from the previous item.
                    // This is `(prefix[i-1][j] - prefix[i-1][j - A[i] - 1]) % mod`.
                    var prevItemTotalSum = cumulativeSums[ currentElementIdx - 1 ][ currentCapacity ];
                    var prevItemSubtractedSum = cumulativeSums[ currentElementIdx - 1 ][ previousSumIndex ];
                    currentCounts[ currentCapacity ] = ( prevItemTotalSum - prevItemSubtractedSum ) % primeDivisor;
                }
                else
                {
                    // If the lower bound is negative, simply use the full prefix sum
                    // up to the current capacity from the previous item.
                    currentCounts[ currentCapacity ] = cumulativeSums[ currentElementIdx - 1 ][ currentCapacity ] % primeDivisor;
                }

                // Update the prefix sum array for the current item and capacity.
                cumulativeSums[ currentElementIdx ][ currentCapacity ] = currentCapacity > 0
                    ? ( ( cumulativeSums[ currentElementIdx ][ currentCapacity - 1 ] + currentCounts[ currentCapacity ] ) % primeDivisor )
                    : ( currentCounts[ currentCapacity ] % primeDivisor );
            }
        }
    }

    // The result is the number of ways to form the `targetSum`
    // after considering all `itemCount` items.
    return currentCounts[ targetSum ] % primeDivisor;
}


/**
 * Orchestrates the overall program flow: reading input, parsing data,
 * invoking the core computation, and finally displaying the outcome.
 *
 * @param {string} rawInputData - The complete raw string content read from standard input.
 */
function processInputAndOutput ( rawInputData )
{
    // Divide the raw input string into an array of lines.
    var inputLines = rawInputData.split("\n");

    // Parse the first line to extract the number of items and the target sum.
    var parsedDimensions = inputLines[0].split(' ').map( strVal => parseInt( strVal, 10 ) );
    var itemCount = parsedDimensions[0]; // Assign the first dimension.
    var targetSum = parsedDimensions[1]; // Assign the second dimension.

    // Parse the second line to get the array of item values.
    var itemValues = inputLines[1].split(' ').map( strVal => parseInt( strVal, 10 ) );

    // Execute the main algorithm to obtain the computed answer.
    var finalResult = calculateCombinations( itemCount, targetSum, itemValues );

    // Output the calculated result to the console.
    console.log( finalResult );
}

// Immediately invoke the main processing function, reading data from standard input.
processInputAndOutput( require('fs').readFileSync('/dev/stdin', 'utf8') );