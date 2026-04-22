/*
 * This JavaScript code implements a solution to the unbounded knapsack problem.
 * It calculates the maximum value that can be obtained by selecting items
 * with given weights and values, subject to a maximum weight capacity.
 *
 * The solution uses dynamic programming.
 */
function knapsack ( ) { // Function definition begins here, with extra spacing

    // C will be our DP table, storing the maximum value for a given number of items
    // and a given capacity. It's initialized as an empty array.
    var C = [ ] ;

    // Initialize the rows of the DP table.
    // Each C[i] will represent the maximum value considering items up to 'i'.
    for ( var i = 0 ; i <= N ; i++ ) {
        C[ i ] = [ ] ;
    }

    // Initialize the first row of the DP table to zeros.
    // This signifies that if the capacity is 0, the max value is 0,
    // regardless of how many items we consider.
    for ( var i = 0 ; i <= W ; i++ ) {
        C[ 0 ][ i ] = 0 ;
    }

    // Initialize the first column of the DP table to zeros.
    // This signifies that if no items are considered (item 0), the max value is 0,
    // regardless of the capacity.
    for ( var i = 0 ; i <= N ; i++ ) {
        C[ i ][ 0 ] = 0 ;
    }

    // This is the core dynamic programming loop.
    // We iterate through each item (from 1 to N).
    for ( var i = 1 ; i <= N ; i++ ) {
        // For each item, we iterate through every possible capacity (from 1 to W).
        for ( var j = 1 ; j <= W ; j++ ) {

            // Calculate how many times the current item 'i' can fit into the current capacity 'j'.
            var k = Math . floor ( j / items[ i ] . w ) ;

            // Calculate the total weight if 'k' items of type 'i' are taken.
            var ww = k * items[ i ] . w ;
            // Calculate the total value if 'k' items of type 'i' are taken.
            var vv = k * items[ i ] . v ;

            // Check if including 'k' items of the current type is feasible
            // within the *total* knapsack capacity (W).
            // Note: The original code compares `ww` with `W` (global capacity), not `j` (current subproblem capacity).
            // This is kept as-is to maintain Type I clone definition.
            if ( ww <= W ) {
                // If taking 'k' items of the current type, along with the best value
                // from the previous item `i-1` and remaining capacity `j-ww`,
                // yields a better value than not taking the current item at all (C[i-1][j]).
                if ( vv + C[ i - 1 ][ j - ww ] > C[ i - 1 ][ j ] ) {
                    // Update the DP table with the new maximum value.
                    C[ i ][ j ] = vv + C[ i - 1 ][ j - ww ] ;
                }
                else {
                    // Otherwise, the maximum value for C[i][j] is the same as
                    // the maximum value without considering item 'i'.
                    C[ i ][ j ] = C[ i - 1 ][ j ] ;
                }
            }
            else {
                // If 'ww' (weight of 'k' items of type 'i') exceeds the total capacity 'W',
                // we cannot include these 'k' items.
                // The value for C[i][j] remains the same as if we hadn't considered item 'i'.
                C[ i ][ j ] = C[ i - 1 ][ j ] ;
            }
        }
    }
    // After filling the DP table, C[N][W] will hold the maximum value
    // for N items and a total capacity of W.
    return C[ N ][ W ] ;
}

// --- Global scope: Input reading and setup for the knapsack problem ---

// Read the entire input from standard input synchronously, decoded as UTF-8.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim any leading/trailing whitespace from the input and then split it into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// The first line of input contains N (number of items) and W (knapsack capacity).
// We remove this line from Arr, split it by space, and convert parts to numbers.
var NW = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;

// Assign the extracted values to global variables N and W.
var N = NW[ 0 ] ; // Number of different item types available.
var W = NW[ 1 ] ; // The maximum weight capacity of the knapsack.

// Initialize an array to store item objects.
// We use a `null` placeholder at index 0 to make it 1-indexed,
// matching the loop in the knapsack function.
var items = [ null ] ;

// Loop through the remaining lines of input to populate the `items` array.
// Each line represents an item type with its value and weight.
for ( var i = 1 ; i <= N ; i++ ) {
    // Take the next line, split it by space, and convert parts to numbers.
    var arr = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;
    // Store each item as an object with 'v' (value) and 'w' (weight) properties.
    items[ i ] = { v : arr[ 0 ] , w : arr[ 1 ] } ;
}

// Call the `knapsack` function to compute the maximum possible value.
var max = knapsack ( ) ;

// Print the calculated maximum value to the console.
console . log ( max ) ;

/*
 * End of the unbounded knapsack problem solution.
 */