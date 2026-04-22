var n, g, u, d; /* Global variables: 'n' for input count, 'g' for graph adjacency,
                       'u' for visited nodes in DFS, 'd' for degree differences. */


/*
 * Function: connected(i)
 * ----------------------
 * Performs a Depth-First Search (DFS) starting from node 'i'.
 * It marks all reachable nodes as visited in the 'u' array.
 *
 * Parameters:
 *   i - The index of the current node to start the DFS from.
 */
function connected( i )
{
    u[i] = true; // Mark the current node 'i' as visited.

    // Iterate through all possible neighbors (0 to 25, representing 'a' through 'z').
    rep( 26, function( j )
    {
        // Check if there is an edge between 'i' and 'j' AND 'j' has not been visited yet.
        if ( g[i][j] && !u[j] )
        {
            connected( j ); // Recursively call 'connected' for the unvisited neighbor 'j'.
        }
    } );
}


/*
 * Function: main()
 * ----------------
 * The primary execution logic of the program.
 * It handles input reading, graph construction, connectivity checks,
 * and degree difference validation for each test case.
 */
function main()
{
    while ( 1 ) // Loop indefinitely until an explicit 'break' statement is encountered.
    {
        n = scan(); // Read the next integer from input into variable 'n'.

        if ( !n ) // If 'n' is falsy (e.g., 0), it signifies the end of input or a termination condition.
        {
            break; // Exit the main processing loop.
        }

        g = []; // Initialize 'g' as an empty array to represent the adjacency list/matrix.
        u = []; // Initialize 'u' as an empty array for tracking visited nodes during DFS.
        d = []; // Initialize 'd' as an empty array for storing degree differences.

        // Initialize the graph 'g' and degree difference 'd' arrays for 26 possible nodes (a-z).
        rep( 26, function( i )
        {
            g[i] = []; // Create an empty array for each node's connections.
            d[i] = 0; // Set the initial degree difference for each node to zero.
        } );

        // Process 'n' number of input strings, each representing an edge.
        rep( n, function()
        {
            var s = scan( 'string' ); // Read an input string, which represents an edge.
            var a = s.charCodeAt( 0 ) - 'a'.charCodeAt( 0 ); // Get the 0-25 index for the first char.
            var b = s.charCodeAt( s.length - 1 ) - 'a'.charCodeAt( 0 ); // Get the 0-25 index for the last char.

            g[a][b] = g[b][a] = true; // Mark the connection between 'a' and 'b' as true (undirected edge).
            ++d[a]; // Increment the "out-degree" (or start-node count) for node 'a'.
            --d[b]; // Decrement the "in-degree" (or end-node count) for node 'b'.
        } );

        /*
         * Identify and mark any isolated nodes (nodes with no connections) as visited.
         * This ensures they don't interfere with the connectivity check later.
         */
        rep( 26, function( i )
        {
            var ind = true; // Assume node 'i' is isolated by default.
            rep( 26, function( j )
            {
                ind = !g[i][j] && ind; // If any connection exists, 'ind' becomes false.
            } );
            if ( ind ) // If 'ind' is still true, node 'i' is isolated.
            {
                u[i] = true; // Mark the isolated node as "visited" so it's excluded from further connectivity checks.
            }
        } );

        /*
         * Perform a connectivity check.
         * Find the first unvisited node and start a DFS from it.
         * We only need to start one DFS; if the graph is connected, all
         * reachable nodes will be marked.
         */
        rep( 26, function( i )
        {
            if ( !u[i] ) // If node 'i' has not been visited yet (i.e., not isolated and not part of a previous component).
            {
                connected( i ); // Start the DFS from this unvisited node.
                return false; // Stop iterating after starting the first DFS.
            }
        } );

        var ans = true; // Initialize the answer flag to true (optimistic assumption).

        /*
         * Final validation:
         * 1. All nodes must be marked as visited (either isolated or part of the connected component).
         * 2. The net degree difference 'd[i]' for all nodes must be exactly zero.
         *    This condition is typical for an Euler circuit or a graph where all
         *    intermediate nodes have balanced incoming/outgoing edges.
         */
        rep( 26, function( i )
        {
            // Update 'ans': it remains true only if current node 'i' is visited AND its degree difference is 0.
            ans = u[i] && d[i] === 0 && ans;
        } );

        print( ans ? 'OK' : 'NG' ); // Output 'OK' if all conditions met, otherwise 'NG'.
    }
}


/*
 * Function: rep(a, b, c)
 * ----------------------
 * A versatile loop utility function.
 * Supports two main signatures:
 * 1. rep(count, callback): Loops 'count' times, calling 'callback(i)' for i from 0 to count-1.
 * 2. rep(start, end, callback): Loops from 'start' up to (but not including) 'end', calling 'callback(i)'.
 *
 * If the provided callback function returns 'false', the loop will break prematurely.
 */
function rep( a, b, c )
{
    // Check if the third argument 'c' is null, indicating the (count, callback) signature.
    if ( c == null )
    {
        c = b; // The second argument 'b' is actually the callback function.
        b = a; // The first argument 'a' is the loop count (becomes the 'end' value).
        a = 0; // Set the starting index 'a' to 0 for this signature.
    }
    for ( var i = a; i < b; ++i ) // Standard for loop from 'a' to 'b'-1.
    {
        if ( c( i ) === false ) // Execute the callback 'c' with the current index 'i'.
        {                        // If the callback explicitly returns 'false',
            break;               // terminate the loop immediately.
        }
    }
}


/* --- Standard Input/Output Handling Setup --- */

process.stdin.resume();            // Keep the Node.js process running to listen for input.
process.stdin.setEncoding( 'utf8' ); // Specify that the input data should be interpreted as UTF-8 encoded text.

var input = '';           // A string variable to accumulate all incoming data from stdin.
var input_index = 0;      // An index to track the current position in the 'input' array after splitting.


/*
 * Function: scan(type)
 * --------------------
 * Reads and returns the next token from the processed input buffer.
 *
 * Parameters:
 *   type - An optional string. If 'string', returns the token as a string.
 *          Otherwise (or if omitted), attempts to convert the token to a number.
 *
 * Returns:
 *   The next token from the input, either as a string or a number.
 */
function scan( type )
{
    if ( type === 'string' ) // If the requested type is 'string',
    {
        return input[ input_index++ ]; // Return the token directly as a string and advance the index.
    }
    else // Otherwise (implicitly requesting a number),
    {
        return +input[ input_index++ ]; // Convert the token to a number using unary plus and advance the index.
    }
}


/*
 * Function: print(val)
 * --------------------
 * Outputs the given value to the console, followed by a newline character.
 *
 * Parameters:
 *   val - The value to be printed to standard output.
 */
function print( val )
{
    console.log( val ); // Utilizes Node.js's console.log for output.
}


// Event listener: Appends incoming data chunks from stdin to the 'input' buffer.
process.stdin.on( 'data', function( chunk )
{
    input += chunk; // Concatenate the new 'chunk' of data to the existing 'input' string.
} );


// Event listener: Triggered when the standard input stream has ended.
process.stdin.on( 'end', function()
{
    // Split the accumulated input string by any whitespace character(s) into an array of tokens.
    input = input.split( /\s+/ );
    main(); // Call the main function to begin the program's core logic with the parsed input.
} );