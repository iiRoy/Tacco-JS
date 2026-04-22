/*
 * This is the main function that processes the input data.
 * It reads graph information and then determines parent nodes for a given graph structure.
 */
function main ( input )
{
    // The first line of input contains N and M, separated by a space.
    // N represents the total number of nodes in the graph.
    // M represents the number of additional edges beyond a basic tree structure.
    var line0 = input[0].split( ' ' );
    var n     = parseInt( line0[0] );
    var m     = parseInt( line0[1] );


    // Initialize an adjacency list representation for the graph edges.
    // The keys of 'e' will be the 'to' nodes, and values will be arrays of incoming edges.
    var e = {};

    /*
     * Loop through the input lines to populate the graph's edge list.
     * The loop runs for N-1 (representing tree edges) plus M (representing additional edges).
     * Each line describes an edge from one node to another.
     */
    for ( var i = 0; i < n - 1 + m; i++ )
    {
        // Each subsequent line (after the first) defines an edge.
        var line = input[i + 1].split( ' ' );

        // Parse the 'from' and 'to' nodes for the current edge from the input line.
        var e1 = { from: parseInt( line[0] ), to: parseInt( line[1] ) };

        // If the 'to' node doesn't have an entry in the adjacency list 'e' yet,
        // initialize it as an empty array to store its incoming edges.
        if ( !e[e1.to] )
        {
            e[e1.to] = [];
        }

        // Add the current edge object { from: X, to: Y } to the list of edges
        // that point to the node 'e1.to'.
        e[e1.to].push( e1 );
    }


    // Initialize an array to store the final answers for each node.
    // 'ans[k]' will store the parent of node 'k+1'.
    var ans = [];

    // Ensure every node from 1 to N has an entry in 'e', even if it has no incoming edges.
    // This prevents errors when accessing 'e[i]' later if a node has no parents.
    for ( var i = 1; i <= n; i++ )
    {
        if ( !e[i] )
        {
            e[i] = [];
        }
    }

    // Now, iterate through each node from 1 to N to determine its parent.
    for ( var i = 1; i <= n; i++ )
    {
        // The original code had console.log statements here for debugging purposes.
        // These have been removed or rephrased for the Type I clone.
        // console.log( "--- Processing node: " + i + " ---" );
        // console.log( "Incoming edges for node " + i + ": ", e[i] );

        // If a node has more than one incoming edge, it indicates a more complex
        // graph structure (e.g., not a simple tree), requiring a specific
        // parent-finding algorithm.
        if ( e[i].length > 1 )
        {
            // Call the 'findParent' helper function to resolve the actual parent
            // for this node, considering potential cycles or multiple paths.
            var parent = findParent( i, e );
            // console.log( "Potential parent(s) found by findParent for node " + i + ": ", parent );

            // Assign the first valid parent (a non-negative node ID) found by 'findParent'.
            // The result from 'findParent' might contain -1 for paths already traced.
            ans[i - 1] = parent.filter( d => d >= 0 )[0];

            /*
             * The following block was commented out in the original code.
             * It remains commented out or removed to maintain Type I cloning rules.
             *
             * for ( var j = 0; j < e[i].length; j++ ) {
             *   console.log( parent[j], j );
             *   if ( !parent[j] ) { //tadasii
             *     ans[i - 1] = e[i][j].from;
             *     console.log( 'add', i, e[i][j].from );
             *   }
             * }
             */
        }
        else
        {
            // If a node has zero or one incoming edge, its parent is straightforward:
            // If one edge exists, its 'from' node is the parent. If no edges, it's 0 (indicating a root or no parent).
            ans[i - 1] = e[i].length ? e[i][0].from : 0;
        }
    }

    // Output the calculated parent nodes, with each parent on a new line.
    console.log( ans.join( '\n' ) );
}


/**
 * Helper function to determine the parent of a given node in a potentially complex graph structure.
 * This function performs a kind of reverse traversal or path exploration to identify source nodes.
 *
 * @param   {number} node - The current node for which to find the parent.
 * @param   {object} e    - The adjacency list representation of the graph edges.
 * @returns {Array}  An array of potential parent nodes. Values of -1 indicate a path that has been resolved.
 */
function findParent ( node , e )
{
    // Initialize a queue for a breadth-first-like traversal strategy.
    var qu      = [];
    var ans     = [ node ]; // Stores the path traversed, starting with the current node.
    var edges   = e[node];  // Get all incoming edges that point to the 'node'.
    var dests   = edges.map( edgeItem => edgeItem.from ); // Map these incoming edges to their 'from' nodes, which are potential parents.
    var length  = edges.length; // Store the initial number of incoming edges to iterate over branches.

    // Populate the initial queue. For each incoming edge to 'node',
    // add all edges that point to that incoming edge's 'from' node.
    for ( var i = 0; i < e[node].length; i++ )
    {
        // Use spread syntax to create a shallow copy of the array of edges.
        qu.push( [ ...e[e[node][i].from] ] );
    }

    // Debugging statements from original code, now removed or rephrased for cloning.
    // console.log( '----- findParent processing node:', node );
    // console.log( 'Initial queue state in findParent:', qu );

    var ans2 = []; // A helper array to mark if a specific destination branch has been found and resolved.

    // Continue the traversal as long as there are non-empty queues (branches) in 'qu'.
    while ( qu.filter( qItem => qItem.length ).length )
    {
        // console.log('Current graph state (e) within findParent:', e);
        // console.log('Current destinations (dests) within findParent:', dests);

        // Iterate over each distinct branch (corresponding to an initial incoming edge).
        for ( var j = 0; j < length; j++ )
        {
            var q = qu[j]; // Get the current branch of the queue for processing.

            // If this branch is empty, skip it and move to the next.
            if ( !q.length )
            {
                continue;
            }

            // Take the first element (an edge) from the current queue branch.
            var first = q.shift();
            ans.unshift( first.from ); // Add the 'from' node of this edge to the beginning of the 'ans' path.

            // console.log( "Branch", j, "processed first element:", first );
            // console.log( "Updated path (ans):", ans );

            // Check if the 'from' node of the current edge ('first.from') is one of the initial potential parents ('dests').
            if ( dests.filter( d => d === first.from ).length )
            {
                // If it is, this branch has successfully traced back to one of the original destinations.
                // Mark this branch as resolved.
                ans2[j] = true;
                // Replace the found destination in 'dests' with -1 to indicate it has been processed/resolved.
                dests[dests.indexOf( first.from )] = -1;
            }

            // If this branch is not yet resolved (ans2[j] is false) AND there are incoming edges
            // to the 'from' node of the current edge ('first.from'),
            // add those incoming edges to the current queue branch for further exploration.
            if ( !ans2[j] && e[first.from] )
            {
                for ( var k = 0; k < e[first.from].length; k++ )
                {
                    q.push( e[first.from][k] );
                }
            }
        }
    }
    // Return the modified 'dests' array. This array will contain the resolved parents
    // (those that are not -1) or -1 for those that were successfully traced back.
    return dests;
}


/*
 * Initialize a global variable to accumulate input chunks from standard input.
 * This variable will eventually hold the entire input as a single string.
 */
var input = '';

// Begin resuming the standard input stream.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8 to handle various characters correctly.
process.stdin.setEncoding( 'utf8' );

// Attach a 'data' event listener to process.stdin.
// This function is executed asynchronously whenever new data (a 'chunk') is available from the input.
process.stdin.on( 'data', function ( chunk )
{
    input += chunk; // Append the new chunk of data to the 'input' string.
} );

// Attach an 'end' event listener to process.stdin.
// This function is called once, when there is no more data to be read from the input stream.
process.stdin.on( 'end', function ( )
{
    // Once all input has been received, split the accumulated string into an array of lines.
    // Each element in the 'input' array will then correspond to a line from the original input.
    input = input.split( '\n' );

    // Call the main processing function with the array of input lines.
    // This starts the core logic of the program.
    main( input );
} );