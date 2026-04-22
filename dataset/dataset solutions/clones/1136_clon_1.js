function main ( _stdin )
{
    // This function serves as the primary entry point for the knapsack problem solver.
    // It takes raw standard input, parses it, and then orchestrates the calculation
    // of the maximum value that can be obtained from a set of items within a given weight limit.

    // First, process the raw input string.
    // It splits the input by newline characters and filters out any empty lines,
    // resulting in an array where each element is a non-empty line from the input.
    const stdin = _stdin . split ( '\n' ) . filter ( e => e . length ) ;

    // The very first line of the input typically contains two space-separated numbers:
    // `len` (the total number of items, though not directly used in this DP solution's loop)
    // and `maxWeight` (the maximum capacity of the knapsack).
    // `shift()` removes and returns this first line from the `stdin` array.
    const [ len , maxWeight ] = stdin . shift ( ) . split ( ' ' ) . map ( Number ) ;

    // The remaining lines in `stdin` represent the items.
    // Each item line is expected to contain two space-separated numbers: [value, weight].
    // This `map` operation transforms each line into an array of two numbers.
    const items = stdin . map ( e =>
    {
        return e . split ( ' ' ) . map ( Number ) ;
    } ) ;

    // Call the `findMaxVal` function to compute the optimal solution.
    // This function will return an array `[totalMaxValue, totalMaxWeight]`
    // for the knapsack with `maxWeight` capacity.
    const maxVal = findMaxVal ( items , maxWeight ) ;

    // Finally, print the maximum value found to the console.
    // This corresponds to the first element of the `maxVal` array.
    console . log ( maxVal [ 0 ] ) ;
}


/**
 * Implements a dynamic programming solution to the 0/1 Knapsack Problem.
 * It determines the maximum value that can be carried in a knapsack
 * given a set of items, each with a value and a weight, and a maximum weight capacity.
 *
 * @param   {Array<Array<number>>} items     - An array of items, where each item is represented as `[value, weight]`.
 * @param   {number}               maxWeight - The maximum weight the knapsack can hold.
 * @returns {Array<number>} An array `[maxValue, totalWeight]` representing the maximum value
 *                          and the corresponding total weight for the knapsack with `maxWeight` capacity.
 */
function findMaxVal ( items , maxWeight )
{
    // Initialize the dynamic programming table.
    // `table` will store the optimal `[value, weight]` pair for each possible knapsack capacity.
    // `table[j]` will hold the maximum value and its corresponding total weight for a knapsack
    // with a capacity of `j`.
    // We create `maxWeight + 1` entries to cover capacities from 0 to `maxWeight`.
    // `fill([0, 0])` initializes each entry; however, beware that `fill` with an object
    // creates references to the *same* object. This is handled by subsequent assignments
    // which replace these references with new arrays.
    const table = new Array ( maxWeight + 1 ) . fill ( [ 0 , 0 ] ) ;

    // `lastTable` is used to store the state of the `table` from the *previous* item's iteration.
    // This is crucial for ensuring that when we consider a new item, its inclusion is based
    // on solutions that *did not* include the current item itself in the same iteration.
    let lastTable = [ ] ;

    // Iterate through each item available in the `items` array.
    // `i` is the index of the current item being considered.
    // `l` stores the total number of items for loop efficiency.
    for ( let i = 0 , l = items . length ; i < l ; i ++ )
    {
        // Before processing the current item (`items[i]`),
        // copy the current state of `table` into `lastTable`.
        // `slice()` creates a shallow copy of the array, meaning new array references
        // for `table`'s elements, which is correct here as elements are arrays themselves.
        lastTable = table . slice ( ) ;

        // For each item, we need to update the `table` for all possible knapsack capacities.
        // `j` represents the current knapsack capacity being evaluated, from 0 up to `maxWeight`.
        for ( let j = 0 ; j <= maxWeight ; j ++ )
        {
            // Base case: If the knapsack capacity `j` is 0, then no items can be placed.
            if ( j === 0 )
            {
                table [ j ] = [ 0 , 0 ] ; // Value and weight for capacity 0 are both 0.
            }
            else
            {
                // This block handles the core dynamic programming logic for a capacity `j`.
                // We are considering `items[i]` and deciding whether to include it or not.

                // `ref` is a reference to a previous state in `lastTable`.
                // It represents the optimal `[value, weight]` for a knapsack with capacity
                // `j - items[i][1]` (current capacity minus the weight of the current item).
                // This is used if we decide to include `items[i]`.
                const ref = lastTable [ j - items [ i ] [ 1 ] ] ;

                // Decision Point 1: Consider placing *only* the current item `items[i]` if it fits
                // and if it results in a higher value than what's currently stored in `table[j]`
                // (which, at this point in the inner loop, is effectively `lastTable[j]` for this item).
                // `j >= items[i][1]` checks if the current item's weight fits in capacity `j`.
                // `table[j][0] < items[i][0]` checks if the current item's value is greater
                // than the best value currently stored for capacity `j`.
                table [ j ] = j >= items [ i ] [ 1 ] && table [ j ] [ 0 ] < items [ i ] [ 0 ]
                    ? items [ i ] . slice ( ) // If conditions met, take a copy of the current item `[value, weight]`.
                    : table [ j ] ;            // Otherwise, keep the existing best solution for capacity `j`.

                // Decision Point 2: Consider placing the current item `items[i]` *in addition to*
                // a previously optimal combination from `lastTable`.
                // This check is performed only if `ref` (the solution for `j - items[i][1]`) exists.
                // `ref !== undefined` ensures a valid previous state exists.
                // `j >= ref[1] + items[i][1]` ensures that the combined weight does not exceed
                // the current knapsack capacity `j`.
                if ( ref !== undefined && j >= ref [ 1 ] + items [ i ] [ 1 ] )
                {
                    // Calculate the new total value and total weight if `items[i]` is added
                    // to the solution represented by `ref`.
                    const newVal = [ ref [ 0 ] + items [ i ] [ 0 ] , ref [ 1 ] + items [ i ] [ 1 ] ] ;

                    // Update `table[j]` if this `newVal` combination yields a higher total value
                    // than what is currently stored in `table[j]`.
                    table [ j ] = table [ j ] [ 0 ] < newVal [ 0 ]
                        ? newVal . slice ( ) // If the new combination is better, take a copy of it.
                        : table [ j ] ;      // Otherwise, retain the existing best solution for capacity `j`.
                }
            }
        }
    }
    // After iterating through all items and considering all possible capacities,
    // `table[maxWeight]` will contain the maximum value and the total weight
    // for a knapsack with the overall `maxWeight` capacity.
    return table [ maxWeight ] ;
}

// Execute the main function by reading input from standard input.
// `require('fs').readFileSync('/dev/stdin', 'utf8')` synchronously reads
// the entire content of `/dev/stdin` (standard input) as a UTF-8 string.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;