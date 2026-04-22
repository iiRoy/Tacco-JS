// This file implements Kruskal's algorithm for finding the Minimum Spanning Tree (MST)
// using a Disjoint Set Union (DSU) data structure.
// It processes graph input from stdin and outputs the MST cost to stdout.


// Global variables declaration.
// These variables are essential for the graph representation and the DSU operations.
var n ;                                 // 'n' will store the number of nodes in the graph.
var g = [ ] ;                           // 'g' is an array to store all edges of the graph.
                                        // Each edge is represented as [cost, u, v].
var p = [ ] ;                           // 'p' (parent) array for the Disjoint Set Union (DSU) structure.
                                        // p[i] stores the parent of element i.
var r = [ ] ;                           // 'r' (rank) array for the DSU structure, used for union by rank optimization.
                                        // r[i] stores the rank of the set rooted at i.


// --- DSU (Disjoint Set Union) Operations ---

/**
 * Initializes the Disjoint Set Union (DSU) data structure.
 * Each element is initially in its own set, with itself as its parent
 * and a rank of 0.
 */
function init ( )
{
    // Loop through all possible elements (nodes) based on the number of edges.
    rep ( g . length , function ( i )
    {
        p [ i ] = i ;                   // Set each element's parent to itself.
        r [ i ] = 0 ;                   // Initialize the rank of each set to 0.
    } ) ;
}


/**
 * Finds the representative (root) of the set to which element 'i' belongs.
 * This function also performs path compression for optimization,
 * making future 'find' operations faster.
 *
 * @param {number} i - The element whose set representative needs to be found.
 * @returns {number} The representative (root) of the set containing 'i'.
 */
function find ( i )
{
    return p [ i ] === i                // If 'i' is its own parent, it's the root.
         ? i                            // Return 'i' if it's the root.
         : p [ i ] = find ( p [ i ] ) ; // Otherwise, recursively find the root and compress the path.
}


/**
 * Checks if two elements 'i' and 'j' belong to the same set.
 * This is determined by comparing the representatives of their respective sets.
 *
 * @param {number} i - The first element.
 * @param {number} j - The second element.
 * @returns {boolean} True if 'i' and 'j' are in the same set, false otherwise.
 */
function same ( i , j )
{
    return find ( i ) === find ( j ) ;  // Compare the roots of the sets containing 'i' and 'j'.
}


/**
 * Merges the sets containing elements 'i' and 'j' into a single set.
 * This operation uses the union by rank heuristic to maintain a balanced tree structure,
 * which optimizes the overall performance of DSU operations.
 *
 * @param {number} i - An element from the first set to be merged.
 * @param {number} j - An element from the second set to be merged.
 */
function unite ( i , j )
{
    var a = find ( i ) ;                // Find the representative of element 'i'.
    var b = find ( j ) ;                // Find the representative of element 'j'.
    
    // If 'a' and 'b' are already the same, it means 'i' and 'j' are already in the same set.
    // In this case, no union operation is needed.
    if ( a === b )
    {
        return ;
    }

    // Perform union by rank: attach the smaller rank tree under the root of the higher rank tree.
    if ( r [ a ] > r [ b ] )
    {
        p [ b ] = a ;                   // Set 'a' as the parent of 'b'.
    }
    else
    {
        p [ a ] = b ;                   // Set 'b' as the parent of 'a'.
        // If ranks were equal, the rank of the new root ('b' in this case) increments.
        if ( r [ a ] === r [ b ] )
        {
            ++ r [ b ] ;
        }
    }
}


// --- Main Algorithm Logic (Kruskal's) ---

/**
 * The main function orchestrates the Kruskal's algorithm.
 * It reads graph input, builds an edge list, sorts edges by weight,
 * and then iteratively adds edges to form the MST using the DSU structure.
 */
function main ( )
{
    n = scan ( ) ;                      // Read the number of nodes (vertices) in the graph.

    // Read the adjacency matrix representation of the graph and convert it into an edge list.
    // We only consider edges where i < j to avoid duplicates and self-loops.
    rep ( n , function ( i )
    {
        rep ( n , function ( j )
        {
            var c = scan ( ) ;          // Read the cost (weight) of the edge between node 'i' and 'j'.
            if ( i < j && c !== -1 )    // If it's a valid edge (not a self-loop, not a duplicate, and exists).
            {
                g [ g . length ] = [ c , i , j ] ; // Add the edge [cost, node1, node2] to the global edge list 'g'.
            }
        } ) ;
    } ) ;

    // Sort all edges in non-decreasing order of their costs (weights).
    // This is a crucial step for Kruskal's algorithm.
    g . sort ( function ( a , b )
    {
        return a [ 0 ] - b [ 0 ] ;      // Sort based on the first element of the edge array (which is the cost).
    } ) ;

    init ( ) ;                          // Initialize the DSU structure before processing edges.

    var ans = 0 ;                       // Initialize the total cost of the Minimum Spanning Tree.

    // Iterate through the sorted edges and apply Kruskal's algorithm.
    rep ( g . length , function ( i )
    {
        var e = g [ i ] ;               // Get the current edge: e[0]=cost, e[1]=u, e[2]=v.

        // Check if adding this edge (e[1], e[2]) would form a cycle in the current MST.
        // If the two endpoints are already in the same set, adding the edge creates a cycle.
        if ( ! same ( e [ 1 ] , e [ 2 ] ) )
        {
            ans += e [ 0 ] ;            // If no cycle is formed, add the edge's cost to the total MST cost.
            unite ( e [ 1 ] , e [ 2 ] ) ; // Merge the sets of the two endpoints to reflect the added edge.
        }
    } ) ;

    print ( ans ) ;                     // Output the final calculated Minimum Spanning Tree cost.
}


// --- Utility Functions ---

/**
 * A flexible repetition function, similar to a 'for' loop.
 * Can be used in two ways:
 * 1. rep(count, callback): Loops from 0 up to (but not including) 'count'.
 * 2. rep(start, end, callback): Loops from 'start' up to (but not including) 'end'.
 * The callback function receives the current loop index 'i' as an argument.
 * If the callback returns 'false', the loop breaks prematurely.
 *
 * @param {number} a - Either the loop count or the starting index.
 * @param {number|function} b - Either the ending index or the callback function.
 * @param {function} [c] - The callback function (required if 'a' is start, 'b' is end).
 */
function rep ( a , b , c )
{
    if ( c === undefined )              // Check if the 'c' (callback) argument is missing.
    {
        c = b ;                         // If missing, 'b' is the callback.
        b = a ;                         // 'a' is the count, so 'b' becomes the end index (from 0 to a).
        a = 0 ;                         // Start index is 0.
    }
    for ( var i = a ; i < b ; ++ i )    // Standard for loop with adjusted start and end.
    {
        if ( c ( i ) === false )        // Execute the callback; if it returns false, break the loop.
        {
            break ;
        }
    }
}


// --- Standard Input/Output Setup for Node.js ---

// Resume the standard input stream, allowing data to be read.
process . stdin . resume ( ) ;
// Set the encoding for the standard input to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;


var input = '' ;                        // A global string variable to accumulate all input data.
var input_index = 0 ;                   // A pointer to keep track of the current position in the 'input' string during scanning.


/**
 * Scans and returns the next token from the accumulated input string.
 * Tokens are separated by whitespace.
 *
 * @param {string} [type] - Optional. If 'string', returns the token as a string.
 *                          Otherwise, attempts to convert the token to a number.
 * @returns {string|number} The scanned token, either as a string or a number.
 */
function scan ( type )
{
    if ( type === 'string' )            // If 'string' type is requested.
    {
        return input [ input_index ++ ] ; // Return the token as a string and advance the index.
    }
    else                                // Otherwise, assume number type.
    {
        return + input [ input_index ++ ] ; // Convert the token to a number using unary plus and advance the index.
    }
}


/**
 * Prints a given value to the console, followed by a newline.
 * This is a wrapper around console.log for consistent output.
 *
 * @param {*} val - The value to be printed.
 */
function print ( val )
{
    console . log ( val ) ;             // Use console.log to output the value.
}


// Event listener for 'data' event on stdin.
// Appends incoming data chunks to the 'input' buffer.
process . stdin . on ( 'data' , function ( chunk )
{
    input += chunk ;                    // Concatenate the new chunk of data to the 'input' string.
} ) ;

// Event listener for 'end' event on stdin.
// This signifies that all input has been received.
// It processes the accumulated input and then calls the main algorithm function.
process . stdin . on ( 'end' , function ( )
{
    input = input . trim ( ) . split ( /\s+/ ) ; // Trim leading/trailing whitespace and split the input string by any whitespace
                                                 // into an array of tokens.
    main ( ) ;                                   // Call the primary function to start the MST calculation.
} ) ;