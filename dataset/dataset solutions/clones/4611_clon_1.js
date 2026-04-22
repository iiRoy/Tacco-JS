/*
 * This file contains utility functions and the main program logic.
 * It's designed to solve a specific problem using dynamic programming
 * or a similar approach on a weight/value table.
 */

// Helper function to parse an integer from a string.
function pint( s )   {
    return parseInt( s ); /* Converts string to integer base 10 */
}


// Helper function to parse a float from a string.
function pfloat( s ) {
    return parseFloat( s ); // Standard JavaScript function
}


/*
 *  Extending Array.prototype with custom sorting and utility methods.
 *  These methods operate on the array instance they are called upon.
 */

// Sorts an array of numbers in ascending order.
Array.prototype.sortNumAsc = function ( ) {
    return this.sort( ( a , b ) => ( a - b ) );
};


// Sorts an array of numbers in descending order.
Array.prototype.sortNumDesc = function ( ) {
    return this.sort( ( a , b ) => ( b - a ) );
};


// Sorts an array of strings in ascending (lexicographical) order.
Array.prototype.sortStrAsc = function ( ) {
    return this.sort( ); // Default sort for strings
};


// Sorts an array of strings in descending (lexicographical) order.
Array.prototype.sortStrDesc = function ( ) {
    return this.sort( ).reverse( );
};


// Returns a new array with all occurrences of 'x' removed.
Array.prototype.without = function ( x ) {
    return this.filter( e => e !== x ); // Filters out elements equal to x
};


/*
 * The main function that processes input lines and calculates the result.
 * This looks like a variation of the Knapsack problem.
 *
 * @param {Array<string>} lines - An array of strings, where each string is a line from input.
 */
function main( lines ) {
    // Parse the first line to get N (number of items) and W (max weight).
    var arr = lines[ 0 ].split( ' ' ).map( pint ); // Splitting by space and parsing integers
    var N   = arr[ 0 ]; // Number of items
    var W   = arr[ 1 ]; // Maximum weight capacity

    // Process the remaining lines: slice, split, and parse.
    // Each line represents an item with its weight and value.
    lines = lines.slice( 1 ).map( l => l.split( ' ' ).map( pint ) );

    // Initialize the dynamic programming table (or memoization table).
    // ttbl will store the maximum value for a given total weight.
    // { weight: max_value }
    var ttbl = { 0 : 0 }; // Base case: 0 weight has 0 value

    // Iterate through each item.
    for ( var i = 0 ; i < N ; i++ ) {
        var w = lines[ i ][ 0 ]; // Current item's weight
        var v = lines[ i ][ 1 ]; // Current item's value

        // Create a temporary table for the current iteration's results.
        var tbl = { };

        // Iterate over the existing entries in ttbl (previous states).
        for ( var k in ttbl ) {
            var tw = pint( k ); // Total weight from previous state
            var tv = ttbl[ k ]; // Total value from previous state

            // If the current state (k, tv) is better or new, update tbl.
            // This ensures we keep the maximum value for a given weight.
            if ( ! ( tbl[ k ] && tv < tbl[ k ] ) ) {
                tbl[ k ] = tv;
            }

            // Consider adding the current item (w, v) to the previous state (tw, tv).
            // Check if adding the item exceeds max weight W.
            // Also, check if this new combination (tw+w, tv+v) is better than any existing one.
            if ( ( tw + w <= W ) && ( ! ( tbl[ tw + w ] && ( tv + v ) < tbl[ tw + w ] ) ) ) {
                tbl[ tw + w ] = tv + v; // Update with new max value for this weight
            }
        }
        // Update the main table with the results from this iteration.
        ttbl = tbl; // ttbl now holds optimal values considering items up to 'i'
    }

    // After processing all items, find the maximum value in the final table.
    var ans = 0; // Initialize answer to 0

    // Loop through all possible total weights in ttbl.
    for ( var n in ttbl ) {
        ans = Math.max( ans , ttbl[ n ] ); // Keep track of the highest value found
    }

    // Output the final answer.
    console.log( ans ); // Print the maximum achievable value
}


// Main execution block:
// Reads input from stdin, processes it, and passes to the main function.
// This part is crucial for competitive programming environments.
main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ).split( '\n' ).map( l => l.trim( ) ) );