/*
 * This function implements the 0/1 Knapsack problem using dynamic programming.
 * It calculates the maximum value that can be obtained by selecting items
 * without exceeding the total weight capacity W.
 */
function knapsack ( )
{
    // C[i][j] will store the maximum value for j weight capacity
    // considering items up to index i.
    var C = [ ] ;

    // Initialize the 2D array for dynamic programming.
    // The dimensions are (N+1) x (W+1).
    for ( var i = 0 ; i <= N ; i++ )
    {
        C[i] = [ ] ; // Create a new row for each item index.
    }

    // Initialize the first row (i=0) to all zeros.
    // This represents the case where no items are considered,
    // so the value is always 0, regardless of capacity.
    for ( var i = 0 ; i <= W ; i++ )
    {
        C[0][i] = 0 ;
    }

    // Initialize the first column (j=0) to all zeros.
    // This represents the case where the capacity is 0,
    // so no items can be taken, and the value is always 0.
    for ( var i = 0 ; i <= N ; i++ )
    {
        C[i][0] = 0 ;
    }

    // Fill the DP table using the knapsack recurrence relation.
    // Iterate through each item from 1 to N.
    for ( var i = 1 ; i <= N ; i++ )
    {
        // Iterate through each possible weight capacity from 1 to W.
        for ( var j = 1 ; j <= W ; j++ )
        {
            // Check if the current item's weight is less than or equal to the current capacity.
            // Note: 'items' array is 1-indexed, so items[i] refers to the i-th item.
            if ( items[i].w <= j )
            {
                // If the item can fit, decide whether to include it or not.
                // Compare:
                // 1. Value if item 'i' is included: items[i].v + C[i-1][j - items[i].w]
                //    (value of current item + max value for remaining capacity with previous items)
                // 2. Value if item 'i' is excluded: C[i-1][j]
                //    (max value for current capacity with previous items)
                if ( items[i].v + C[i-1][j - items[i].w] > C[i-1][j] )
                {
                    C[i][j] = items[i].v + C[i-1][j - items[i].w] ;
                }
                else
                {
                    C[i][j] = C[i-1][j] ;
                }
            }
            else
            {
                // If the current item's weight is greater than the current capacity,
                // it cannot be included. So, the value is the same as without this item.
                C[i][j] = C[i-1][j] ;
            }
        }
    }

    // The maximum value for the given N items and capacity W is at C[N][W].
    return C[N][W] ;
}

// --- Input Processing Section ---

// Read the entire input from standard input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim leading/trailing whitespace and split the input into an array of lines.
var Arr = ( input.trim ( ) ) . split ( "\n" ) ;

// The first line contains N (number of item types) and W (knapsack capacity).
// Parse them as numbers.
var nW = ( Arr.shift ( ) ) . split ( " " ) . map ( Number ) ;

// Extract N and W.
var n = nW[0] ; // n is the number of original item types
var W = nW[1] ; // W is the maximum weight capacity

// N will be the total number of 'effective' items after considering duplicates.
var N = 0 ;

// Initialize the 'items' array. It will store objects {v: value, w: weight}.
// We add a null at index 0 to make it 1-indexed for easier DP table access.
var items = [ null ] ;

// Process the remaining lines, each representing an item type.
// For each item type, create multiple 'effective' items if its weight allows.
for ( var i = 1 ; i <= n ; i++ )
{
    // Parse the current line into an array [value, weight].
    var arr = ( Arr.shift ( ) ) . split ( " " ) . map ( Number ) ;

    var k = 1 ; // Multiplier for the current item type.

    // Use a do-while loop to add multiple instances of the same item type
    // as long as its total weight (original weight * k) does not exceed W.
    do
    {
        // Add an item object to the 'items' array.
        // Value = original_value * k, Weight = original_weight * k.
        items.push ( { v : arr[0] * k , w : arr[1] * k } ) ;

        N++ ; // Increment the total count of 'effective' items.
        k++ ; // Increment the multiplier for the next potential instance.

    } while ( arr[1] * k <= W ) ; // Continue as long as the next instance's weight fits.
}

// --- Knapsack Calculation and Output ---

// Call the knapsack function to get the maximum value.
var max = knapsack ( ) ;

// Print the result to the console.
console.log ( max ) ;