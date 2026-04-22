/*
 * This function solves the 0/1 Knapsack problem using dynamic programming.
 * It calculates the maximum value that can be obtained by selecting
 * items with a total weight not exceeding the knapsack's capacity W.
 *
 * Global variables N, W, and items are expected to be defined.
 * N: total number of available items.
 * W: maximum capacity of the knapsack.
 * items: an array of objects, where each object has 'v' (value) and 'w' (weight) properties.
 */
function knapsack ()
{
        var C = [ ] ; // Initialize the DP table C

        // Initialize rows of the DP table
        for ( var i = 0 ; i <= N ; i++ )
        {
                C[ i ] = [ ] ;
        }

        // Base case: if capacity is 0, max value is 0
        for ( var i = 0 ; i <= W ; i++ )
        {
                C[ 0 ][ i ] = 0 ;
        }

        // Base case: if no items are considered, max value is 0
        for ( var i = 0 ; i <= N ; i++ )
        {
                C[ i ][ 0 ] = 0 ;
        }

        // Fill the DP table
        for ( var i = 1 ; i <= N ; i++ )
        { // Iterate through each item
                for ( var j = 1 ; j <= W ; j++ )
                { // Iterate through each possible weight capacity
                        // Check if the current item's weight is within the current capacity
                        if ( items[ i ].w <= j )
                        {
                                // If including the current item yields a greater value
                                if ( ( items[ i ].v + C[ i - 1 ][ j - items[ i ].w ] ) > C[ i - 1 ][ j ] )
                                {
                                        C[ i ][ j ] = items[ i ].v + C[ i - 1 ][ j - items[ i ].w ] ; // Include the item
                                }
                                else
                                {
                                        C[ i ][ j ] = C[ i - 1 ][ j ] ; // Exclude the item
                                }
                        }
                        else
                        {
                                C[ i ][ j ] = C[ i - 1 ][ j ] ; // Item is too heavy, exclude it
                        }
                }
        }

        // The maximum value for all N items and capacity W is at C[N][W]
        return C[ N ][ W ] ;
}


// --- Main program execution starts here ---

// Read input from standard input
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace and split input into lines
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// Parse the first line for N (number of items) and W (knapsack capacity)
var NW = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;


var n = NW[ 0 ] ; // Number of items (initial count from input)
var W = NW[ 1 ] ; // Knapsack capacity (from input)


var obj = { } ; // Object to store unique item weight-value pairs, handling duplicates/better items

// Process item definitions from input
for ( var i = 1 ; i <= n ; i++ )
{
    var arr = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ; // Current item: [value, weight]

    var k = 1 ; // Multiplier for item duplication (if allowed by problem statement)

    // Generate multiple instances of the same item if its total weight doesn't exceed W
    while ( ( arr[ 1 ] * k ) <= W )
    {
        if ( ( arr[ 1 ] * k ) in obj )
        {
            // If an item with this total weight already exists, check if current is better
            if ( obj[ arr[ 1 ] * k ] > ( arr[ 0 ] * k ) )
            {
                k++ ;
                continue ; // Skip if existing item is better
            }
        }
        // Store or update the item with the current total weight and value
        obj[ arr[ 1 ] * k ] = arr[ 0 ] * k ;
        k++ ;
    }
}

var items = [ null ] ; // Initialize items array (index 0 is unused for 1-based indexing in DP)

// Populate the 'items' array from the processed 'obj'
for ( var p in obj )
{
    items . push ( { v : obj[ p ] , w : p } ) ; // Add item with value 'v' and weight 'w'
}

var N = items . length - 1 ; // Actual number of distinct items after processing and consolidation

// Calculate the maximum value using the knapsack dynamic programming algorithm
var max = knapsack ( ) ;

// Output the result to standard output
console . log ( max ) ;