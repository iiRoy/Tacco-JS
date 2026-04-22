"use strict";
// This directive enforces strict mode for the entire script.

/**
 *  @class I
 *  @brief A custom input parser class designed for competitive programming.
 *         It reads tokens from a multi-line string input.
 */
function I( t , i )
{
    // The input string is split into an array of lines.
    this._s = t.split( "\n" ) ;

    // _c represents the current token index within the current line.
    this._c = 0 ;

    // _l represents the current line index in the input array.
    this._l = 0 ;

    // _f is the default parsing function for tokens, typically Number.
    // If 'i' is provided, it will be used; otherwise, Number is the default.
    this._f = i || Number ;
}

/**
 *  @brief Reads the next token from the input.
 *  @param {function} t - An optional custom parsing function for this specific token.
 *  @returns {*} The parsed token, or undefined if no more input.
 */
I.prototype.a = function ( t )
{
    // Get the current line based on the line index.
    var i = this._s[ this._l ] ;

    // Check if the current line exists (i.e., not end of input).
    if ( i )
    {
        // Trim whitespace and split the line into tokens.
        var s = i . trim ( ) . split ( " " ) ;

        // Get the current token from the line.
        var h = s[ this._c ] ;

        // Increment the token index for the next read.
        this._c ++ ;

        // If all tokens on the current line have been read, reset token index
        // and advance to the next line.
        if ( s . length === this._c )
        {
            this._c = 0 ;
            this._l ++ ;
        }

        // Parse the token using the provided function 't' or the default '_f'.
        return t ? t ( h ) : this._f ( h ) ;
    }

    // If no more lines, return undefined (or whatever the parsing function would return for empty).
    // In this specific implementation, it would just return undefined.
} ;

/**
 *  @brief Reads all tokens from the current line and advances to the next line.
 *  @param {function} t - An optional custom parsing function for each token on the line.
 *  @returns {Array<*>} An array of parsed tokens from the line.
 */
I.prototype.l = function ( t )
{
    var i = this._s[ this._l ] ; // Retrieve the current line.

    if ( i )
    {
        this._c = 0 ; // Reset token index as we're reading the whole line.
        this._l ++ ; // Advance to the next line.

        // Split the line by spaces and map each token using the provided 't'
        // or the default parsing function '_f'.
        return i . split ( " " ) . map ( t || this._f ) ;
    }
} ;

// Export the Input parser class for use in other modules.
module . exports = I ;


/**
 *  @brief The main entry point of the program.
 *  @param {string} input - The raw input string read from stdin.
 */
function main ( input )
{
    // Create a new instance of the input parser.
    var o = new I ( input ) ;

    // Read the number of nodes (n) from the input.
    var n = o . a ( ) ;

    // Initialize an adjacency list for the graph.
    // It's an array of arrays, sized n+1 to use 1-based indexing for nodes.
    var adj = Array ( n + 1 ) . fill ( ) . map ( ( ) => [ ] ) ;
    adj [ 0 ] = undefined ; // Node 0 is typically unused in 1-based indexing.

    // Loop n-1 times to read all edges.
    for ( var i = 0 ; i < n - 1 ; i ++ )
    {
        // Read two connected nodes (a and b) for the current edge.
        var a = o . a ( ) ;
        var b = o . a ( ) ;

        // Add bidirectional edges to the adjacency list.
        adj [ a ] . push ( b ) ;
        adj [ b ] . push ( a ) ;
    }

    // Call the solve function to determine the game outcome.
    var ans = solve ( adj ) ;

    // Output the result based on the 'ans' value.
    if ( ans === "solved" )
    {
        console . log ( "First" ) ; // Special case for a solved state.
    }
    else
    {
        // Determine the winner based on the parity of 'ans'.
        console . log ( ans % 2 === 1 ? "First" : "Second" ) ;
    }
}


/**
 *  @brief Solves the game on a given tree (represented by an adjacency list).
 *  @param {Array<Array<number>>} adj - The adjacency list of the tree.
 *  @returns {number|string} The number of moves, or "solved" if a base case is met.
 */
function solve ( adj )
{
    // Base case: If only one node remains, the game is "solved".
    // We filter out 'undefined' entries (like adj[0]) for the count.
    if ( adj . filter ( x => x ) . length === 1 )
    {
        return 1 ; // One move left to pick the last node.
    }

    // Find the index of a leaf node (a node with degree 1).
    // This is crucial for the game's strategy.
    var oneLeaf = adj . findIndex ( v => v && v . length === 1 ) ;

    // Create a new tree by removing all leaf nodes from the current tree.
    var newTree = removeLeafs ( adj ) ;

    // If the new tree (after removing leaves) still has nodes,
    // recursively solve for this reduced tree.
    if ( newTree . length > 0 )
    {
        // console.log("solve", adj.filter(x => x).length, newTree.filter(x => x).length, newTree)
        var ans1 = solve ( newTree ) ; // Result of solving the tree without leaves.
    }

    // Restore the previously removed leaf node and its connection for the second recursive call.
    // This simulates taking a different first move.
    newTree [ oneLeaf ] = adj [ oneLeaf ] ; // Re-add the leaf node itself.
    if ( newTree [ adj [ oneLeaf ] [ 0 ] ] )
    {
        // Re-add the leaf node to its parent's adjacency list.
        newTree [ adj [ oneLeaf ] [ 0 ] ] . push ( oneLeaf ) ;
    }

    // console.log("solve", adj.filter(x => x).length, newTree.filter(x => x).length, newTree)
    // Solve the tree again, but this time with the specific leaf node re-included.
    var ans2 = solve ( newTree ) ;

    // Compare the results of the two recursive calls (ans1 and ans2).
    if ( ans1 === undefined )
    {
        // If ans1 was undefined (meaning the 'newTree' was empty),
        // then the current player makes a move and the opponent gets ans2.
        return ( ans2 + 1 ) % 2 ;
    }
    if ( ans1 !== ans2 )
    {
        // If the outcomes are different, the current player can force a win in one move.
        return 1 ; // This indicates a winning move.
    }
    else
    {
        // If outcomes are the same, the current player makes a move,
        // and the opponent faces the same situation (ans1), so result is (ans1 + 1) % 2.
        return ( ans1 + 1 ) % 2 ;
    }
}


/**
 *  @brief Creates a new adjacency list by removing all current leaf nodes from the old tree.
 *  @param {Array<Array<number>>} old - The original adjacency list.
 *  @returns {Array<Array<number>>} A new adjacency list with leaf nodes removed.
 */
function removeLeafs ( old )
{
    var leaves = [ ] ; // Array to store indices of leaf nodes.

    // First pass: identify all leaf nodes in the current tree.
    for ( var i = 0 ; i < old . length ; i ++ )
    {
        if ( old [ i ] && old [ i ] . length === 1 )
        {
            leaves . push ( i ) ; // Add node index to leaves array.
        }
    }

    // console.log({leaves}); // Debugging line for identified leaves.

    var newTree = [ ] ; // Initialize the new adjacency list.

    // Second pass: construct the new tree by filtering out connections to leaves.
    old . forEach ( ( v , i ) =>
    {
        // console.log("forEach", v); // Debugging line for current node in forEach.
        if ( v && v . length > 1 )
        {
            // For non-leaf nodes, filter out any connections that lead to a leaf.
            newTree [ i ] = v . filter ( x => leaves . indexOf ( x ) < 0 ) ;
        }
    } ) ;

    return newTree ; // Return the new tree without the identified leaf nodes.
}

// Read input from standard input and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;