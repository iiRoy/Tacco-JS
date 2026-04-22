/*
 * This file implements a Disjoint Set Union (DSU) data structure
 * along with input/output handling for competitive programming.
 */

// Global variables for the DSU structure:
// 'n' will store the total number of elements.
var n;
// 'p' (parent array) stores the parent of each element.
var p = [ ] ;
// 'r' (rank array) stores the rank/height of each tree.
var r = [ ] ;


/**
 * Initializes the Disjoint Set Union structure.
 * Each element is initially in its own set, with rank 0.
 */
function init ( ) {

    // Iterate from 0 to n-1 to initialize each element.
    rep ( n , function ( i ) {
        // Set the parent of element 'i' to itself.
        p [ i ] = i ;
        // Initialize the rank of element 'i' to 0.
        r [ i ] = 0 ;
    } ) ;

}


/**
 * Finds the representative (root) of the set containing element 'x'.
 * Uses path compression for optimization.
 * @param {number} x The element to find the representative for.
 * @returns {number} The representative of the set containing 'x'.
 */
function find ( x ) {

    // If 'x' is its own parent, it is the representative.
    if ( p [ x ] === x ) {
        return x ;
    }

    // Otherwise, recursively find the representative and compress the path.
    return p [ x ] = find ( p [ x ] ) ;

}


/**
 * Checks if two elements 'x' and 'y' belong to the same set.
 * @param {number} x The first element.
 * @param {number} y The second element.
 * @returns {boolean} True if 'x' and 'y' are in the same set, false otherwise.
 */
function same ( x , y ) {
    // They are in the same set if their representatives are the same.
    return find ( x ) === find ( y ) ;
}


/**
 * Unites the sets containing elements 'x' and 'y'.
 * Uses union by rank for optimization.
 * @param {number} x The first element.
 * @param {number} y The second element.
 */
function unite ( x , y ) {

    // Find the representatives of the sets containing 'x' and 'y'.
    var a = find ( x ) ;
    var b = find ( y ) ;


    // If they are already in the same set, do nothing.
    if ( a === b ) {
        return ;
    }


    // Union by rank: attach the smaller rank tree under the root of the larger rank tree.
    if ( r [ a ] > r [ b ] ) {

        p [ b ] = a ; // Make 'a' the parent of 'b'.

    }

    else {

        p [ a ] = b ; // Make 'b' the parent of 'a'.

        // If ranks are equal, increment the rank of the new root.
        if ( r [ a ] === r [ b ] ) {
            ++ r [ b ] ;
        }

    }
}


/**
 * Main function to handle the problem logic.
 * Reads input, performs DSU operations, and prints results.
 */
function main ( ) {

    // Read the total number of elements.
    n = scan ( ) ;

    // Initialize the DSU structure for 'n' elements.
    init ( ) ;

    // Read the number of queries.
    var q = scan ( ) ;

    // Process each query.
    rep ( q , function ( ) {

        // Read the query type.
        var t = scan ( ) ;
        // Read the two elements involved in the query.
        var x = scan ( ) ;
        var y = scan ( ) ;

        // If query type is 0, perform a union operation.
        if ( t === 0 ) {
            unite ( x , y ) ;
        }

        // If query type is 1, check if elements are in the same set and print result.
        else {
            // Convert boolean result to 1 or 0 for printing.
            print ( + same ( x , y ) ) ;
        }

    } ) ;

}


/**
 * A utility function for repetition (looping).
 * Can be used as `rep(n, callback)` (0 to n-1) or `rep(start, end, callback)`.
 * @param {number} a The upper bound (exclusive) or start index.
 * @param {function} b The callback function or upper bound.
 * @param {function} [c] The callback function if 'a' and 'b' are start/end.
 */
function rep ( a , b , c ) {

    // Handle optional arguments for the loop.
    if ( c === undefined ) {
        c = b ; // 'b' is the callback.
        b = a ; // 'a' is the upper bound.
        a = 0 ; // Start from 0.
    }

    // Loop from 'a' (inclusive) to 'b' (exclusive).
    for ( var i = a ; i < b ; ++ i ) {
        // If the callback returns false, break the loop.
        if ( c ( i ) === false ) {
            break ;
        }
    }

}


// Set up standard input processing for Node.js.
process . stdin . resume ( ) ;
process . stdin . setEncoding ( 'utf8' ) ;


// Global variables for input buffering.
var input = '' ;
var input_index = 0 ;


/**
 * Reads a value from the buffered input.
 * Advances the input index.
 * @param {string} [type] Optional type, 'string' for string, otherwise number.
 * @returns {string|number} The parsed input value.
 */
function scan ( type ) {
    if ( type === 'string' ) {
        return input [ input_index ++ ] ;
    }
    else {
        return + input [ input_index ++ ] ; // Convert to number.
    }
}


/**
 * Prints a value to the console.
 * @param {*} val The value to print.
 */
function print ( val ) {
    console . log ( val ) ;
}


// Event listener for receiving data from stdin.
process . stdin . on ( 'data' , function ( chunk ) {
    input += chunk ; // Append incoming data to the input buffer.
} ) ;

// Event listener for the end of stdin input.
process . stdin . on ( 'end' , function ( ) {
    // Split the entire input by whitespace into an array of tokens.
    input = input . split ( / \s + / ) ;
    // Call the main function to start processing.
    main ( ) ;
} ) ;