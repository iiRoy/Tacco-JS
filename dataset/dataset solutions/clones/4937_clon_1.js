'use strict'; /* This directive enables strict mode for the entire script, which helps catch common coding errors and "unsafe" actions. */


function Main( INPUT ) /* The primary function that encapsulates the entire program logic. It takes the raw input string as an argument. */
{
    /*
     * Step 1: Parse the initial input data.
     * The input consists of several lines:
     * - The first line contains W (width) and H (height) separated by a space.
     * - The next W lines contain costs for horizontal edges (p values).
     * - The following H lines contain costs for vertical edges (q values).
     */

    let input = INPUT.split( "\n" ); // Split the entire input string into an array of lines based on the newline character.

    let WH = input[0].split( " " ); // Take the first line (index 0) and split it by space to get W and H.
    let W  = parseInt( WH[0] );     // Convert the first part (width) to an integer.
    let H  = parseInt( WH[1] );     // Convert the second part (height) to an integer.


    let p = [ ]; // Initialize an empty array to store the 'p' values (horizontal edge costs).
    let q = [ ]; // Initialize an empty array to store the 'q' values (vertical edge costs).

    // Populate the 'p' array from the input.
    // These values represent costs for edges connecting (x,y) to (x+1,y).
    for ( let i = 0; i < W; i++ )
    {
        p.push( input[ 1 + i ] ); // Input lines for 'p' start from index 1.
    }

    // Populate the 'q' array from the input.
    // These values represent costs for edges connecting (x,y) to (x,y+1).
    for ( let i = 0; i < H; i++ )
    {
        q.push( input[ 1 + W + i ] ); // Input lines for 'q' start after all 'p' values.
    }


    /*
     * Step 2: Initialize the grid of nodes for the Kruskal's algorithm.
     * Each "node" in our conceptual grid will store:
     * - Its current component ID (for union-find like operations).
     * - The cost of the horizontal edge extending from it to the right.
     * - The cost of the vertical edge extending from it downwards.
     */
    let node = [ ]; // This will be a 2D array, representing a grid of (H+1) x (W+1) nodes.

    for ( let y = 0; y < H + 1; y++ ) // Loop through rows (including the 'phantom' bottom row for vertical edges).
    {
        node.push( [ ] ); // Add a new row to the 'node' grid.

        for ( let x = 0; x < W + 1; x++ ) // Loop through columns (including the 'phantom' rightmost column for horizontal edges).
        {
            node[y][x] = [ ]; // Each element in the grid is an array representing a node's properties.

            // node[y][x][0]: Component ID. Initially, each node has a unique ID.
            // This is calculated as (W+1)*y + x to give a unique flat index.
            node[y][x][0] = ( W + 1 ) * y + x;

            // node[y][x][1]: Cost of the horizontal edge from (x,y) to (x+1,y).
            // If parseInt(p[x]) results in NaN (e.g., if p[x] is undefined for the last column),
            // it defaults to a very large number (10^8 + 1) to effectively disable that edge.
            node[y][x][1] = parseInt( p[x] ) || 100000001;

            // node[y][x][2]: Cost of the vertical edge from (x,y) to (x,y+1).
            // Similar to horizontal edges, defaults to a large number if parsing fails.
            node[y][x][2] = parseInt( q[y] ) || 100000001;
        }
    };
    /* The original code had a commented-out console.log(node); line here. It remains commented. */
    // console.log( node );


    /**
     * Implements a variation of Kruskal's algorithm to find the Minimum Spanning Tree (MST) cost.
     * This recursive function identifies the cheapest available edge that connects two distinct components
     * and merges them, accumulating the cost. It continues until all nodes are connected.
     *
     * @param {number} cost - The accumulated cost of the MST so far.
     * @returns {number} The final total cost of the MST.
     */
    function kruskal( cost )
    {
        // Initialize 'min' with a very large value. This represents the maximum possible edge cost plus one.
        let min = 100000001; // The problem context often uses 10^8 + 1 as an "infinity" value.
        let revise = [ ];   // This array will temporarily hold the component IDs of the two sets to be merged.
        let x = 0, y = 0;   // Loop iterators for grid traversal.

        /*
         * First pass: Search for the minimum cost edge within the main H x W grid area.
         * This includes horizontal edges (rightward) and vertical edges (downward).
         */
        for ( y = 0; y < H; y++ ) // Iterate through rows from 0 to H-1.
        {
            for ( x = 0; x < W; x++ ) // Iterate through columns from 0 to W-1.
            {
                // Check horizontal edge: node[y][x] to node[y][x+1].
                // Condition: The edge cost must be less than current 'min' AND the two nodes must belong to different components.
                if ( node[y][x][1] < min && node[y][x][0] != node[y][x+1][0] )
                {
                    min = node[y][x][1];           // Update 'min' with the new minimum edge cost.
                    revise[0] = node[y][x][0];     // Store the component ID of the first node.
                    revise[1] = node[y][x+1][0];   // Store the component ID of the second node.
                }

                // Check vertical edge: node[y][x] to node[y+1][x].
                // Condition: The edge cost must be less than current 'min' AND the two nodes must belong to different components.
                if ( node[y][x][2] < min && node[y][x][0] != node[y+1][x][0] )
                {
                    min = node[y][x][2];           // Update 'min'.
                    revise[0] = node[y][x][0];     // Store the component ID.
                    revise[1] = node[y+1][x][0];   // Store the component ID.
                }
            }
        };

        /*
         * Second pass: Check horizontal edges along the bottommost row (H).
         * These are edges connecting node[H][x] to node[H][x+1].
         * Note: The 'p' values are indexed by 'x', so p[x] applies to the edge at column 'x'.
         */
        for ( x = 0; x < W; x++ ) // Iterate through columns from 0 to W-1.
        {
            // Check horizontal edge: node[H][x] to node[H][x+1].
            if ( node[H][x][1] < min && node[H][x][0] != node[H][x+1][0] )
            {
                min = node[H][x][1];
                revise[0] = node[H][x][0];
                revise[1] = node[H][x+1][0];
            }
        };

        /*
         * Third pass: Check vertical edges along the rightmost column (W).
         * These are edges connecting node[y][W] to node[y+1][W].
         * Note: The 'q' values are indexed by 'y', so q[y] applies to the edge at row 'y'.
         */
        for ( y = 0; y < H; y++ ) // Iterate through rows from 0 to H-1.
        {
            // Check vertical edge: node[y][W] to node[y+1][W].
            if ( node[y][W][2] < min && node[y][W][0] != node[y+1][W][0] )
            {
                min = node[y][W][2];
                revise[0] = node[y][W][0];
                revise[1] = node[y+1][W][0];
            }
        };


        /*
         * Step 3: Merge components.
         * After finding the minimum cost edge that connects two distinct components (identified by revise[0] and revise[1]),
         * update all nodes that belonged to 'revise[1]' component to now belong to 'revise[0]'.
         * This effectively performs a "union" operation.
         */
        for ( y = 0; y < H + 1; y++ )
        {
            for ( x = 0; x < W + 1; x++ )
            {
                if ( node[y][x][0] == revise[1] ) // If this node belongs to the component being merged *into* another...
                {
                    node[y][x][0] = revise[0]; // ...reassign its component ID to that of the target component.
                }
            }
        };

        // Add the cost of the newly selected edge to the total MST cost.
        // console.log( cost, "->", cost + min ); // Original commented line, kept commented.
        cost += min;
        // console.log( node ); // Original commented line, kept commented.


        /*
         * Step 4: Check for termination condition and recurse.
         * The algorithm terminates when all nodes belong to the same connected component.
         * We check this by comparing every node's component ID to the component ID of node[0][0].
         */
        for ( y = 0; y < H + 1; y++ )
        {
            for ( x = 0; x < W + 1; x++ )
            {
                if ( node[0][0][0] != node[y][x][0] ) // If we find any node not connected to node[0][0]...
                {
                    return kruskal( cost ); // ...then not all nodes are connected yet; recurse to find the next edge.
                }
            }
        };

        // If the loop completes without returning, it means all nodes are now in the same component.
        // The MST is complete, so return the total accumulated cost.
        return cost;
    }


    // Initiate the Kruskal algorithm with an initial accumulated cost of zero.
    let cost = kruskal( 0 );

    // Output the final calculated Minimum Spanning Tree cost to the console.
    console.log( cost );

}

// This line reads the input from standard input (typically /dev/stdin in competitive programming environments)
// and passes it as a UTF-8 encoded string to the Main function for processing.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );