var log = console.log; /* This variable stores a reference to the console.log function. */


/*
 * This block of code handles input processing specifically for Node.js environments.
 * It checks if 'process' object is defined, which is typical for Node.
 */
if ( typeof process != "undefined" )
{
    // A string variable initialized to be empty, used to accumulate all standard input.
    var input = "";

    // Ensures that the standard input stream is active and ready to receive data.
    process.stdin.resume( );

    // Sets the character encoding for the input stream to UTF-8.
    process.stdin.setEncoding( 'utf8' );

    // Attaches an event listener for 'data' events on the standard input.
    // Each time a chunk of data is received, it's appended to the 'input' string.
    process.stdin.on( 'data', function ( chunk )
    {
        input += chunk;
    } );

    // Attaches an event listener for the 'end' event on the standard input.
    // This event fires when there is no more data to be read from stdin.
    process.stdin.on( 'end', function ( )
    {
        // Splits the entire accumulated input string into an array of lines,
        // using the newline character as a delimiter.
        var lines = input.split( "\n" );

        // Calls the primary application logic function, passing the parsed lines.
        main( lines );
    } );
}


/**
 * The main function responsible for processing the input, building the graph,
 * running the DFS algorithm to find bridges, and printing the results.
 * @param {Array<string>} lines - An array of strings, where each string represents a line from the input.
 */
function main ( lines )
{
    /*
     * The last line is popped from the array. If it's not an empty string,
     * it might indicate an extra newline at the end of the input.
     * In such a case, 'lines.push()' is called without arguments, which adds 'undefined'
     * to the end of the array. This behavior is retained as per Type I cloning rules.
     */
    if ( lines.pop( ) != "" )
    {
        lines.push( ); // Pushing 'undefined' to the array.
    }


    /*
     * Transforms each line from a string into an array of numbers.
     * Each line is first split by spaces, and then each resulting string
     * element is converted to a numerical type.
     */
    lines = lines.map( function ( line )
    {
        return line.split( " " ).map( function ( e )
        {
            return Number( e );
        } );
    } );


    // Extracts the first line of processed input, which contains graph dimensions.
    var top_line = lines.shift( );

    // V represents the number of vertices in the graph.
    var V = top_line[ 0 ];

    // E represents the number of edges. This variable is declared but not extensively used later.
    var E = top_line[ 1 ];


    // Declaration and initialization of various arrays used for graph representation and algorithm state.
    var real_edge = [ ]; // Adjacency list: stores connections between vertices.
    var virt_edge = [ ]; // This array is declared but remains unused throughout the code.
    var mark = [ ];      // Boolean array: tracks visited status of vertices during DFS.
    var status = [ ];    // This array is declared but remains unused throughout the code.
    var ord = [ ];       // Integer array: stores the discovery time (order) of each vertex during DFS.
    var lowlink = [ ];   // Integer array: stores the lowest discovery time reachable from a vertex (including itself)
                         // through its DFS subtree and at most one back-edge.
    var bridges = [ ];   // Adjacency list-like structure: stores the identified bridges.
    var used_e = [ ];    // 2D boolean array: tracks if an edge has been used to traverse during DFS,
                         // helping differentiate tree edges from back-edges.


    // Loop to initialize the arrays for each vertex.
    for ( var i = 0 ; i < V ; i++ )
    {
        real_edge[ i ] = [ ]; // Initialize an empty array for each vertex's adjacency list.
        mark[ i ] = false;    // Mark all vertices as unvisited initially.

        /*
         * Original comments in Japanese:
         * ord?????????
         * lowlink??????(dfs????????????????§????){0,}??¨(?????????){0,1}??§?????????ord???????°????
         * ?????????????????????§???????°???????ord
         */
        ord[ i ] = 0;         // Initialize discovery time to 0 for all vertices.
        lowlink[ i ] = V;     // Initialize low-link value to V (a value greater than any possible ord).
        bridges[ i ] = [ ];   // Initialize an empty array to store bridges starting from vertex 'i'.

        used_e[ i ] = [ ];    // Initialize the inner array for edge usage tracking.
        for ( var j = 0 ; j < V ; j++ )
        {
            used_e[ i ][ j ] = false; // Mark all potential edges as unused.
        }
    }


    // Populates the adjacency list 'real_edge' based on the parsed input lines (which now represent edges).
    lines.forEach( function ( edge )
    {
        var a = edge[ 0 ]; // The first vertex of the current edge.
        var b = edge[ 1 ]; // The second vertex of the current edge.

        real_edge[ a ].push( b ); // Add 'b' to the adjacency list of 'a'.
        real_edge[ b ].push( a ); // Add 'a' to the adjacency list of 'b' (for an undirected graph).
    } );


    var no = 0;   // A global counter used to assign unique discovery times ('ord') to vertices.
    var prev = 0; // This variable is declared but appears to be unused in the provided code.


    /**
     * Implements a Depth First Search (DFS) algorithm to calculate discovery times
     * and low-link values for all reachable nodes from a starting point.
     * These values are crucial for detecting bridges in the graph.
     * @param {number} now_point - The current vertex being visited in the DFS traversal.
     */
    function dfs ( now_point )
    {
        /*
         * Original comments in Japanese:
         * now_point????????¨???????????????
         * now_ord????????¨???????????????
         * mark????¨???????????????????
         */
        var np = now_point;              // A local alias for the current node.
        var mk = mark;                   // A local alias for the 'mark' array.
        var targets = real_edge[ np ];   // Retrieve all neighbors of the current node.

        mk[ np ] = true;                 // Mark the current node as visited.
        ord[ np ] = no;                  // Assign the current discovery time to the node.
        lowlink[ np ] = no;              // Initialize the low-link value with the discovery time.
        no++;                            // Increment the global discovery time counter.

        // Iterate over each neighbor (target) of the current node.
        targets.forEach( function ( target )
        {
            // Case 1: The target node has not been visited yet (this is a tree edge).
            if ( !mk[ target ] )
            {
                /*
                 * Original comments in Japanese:
                 * ???????????£????????¨?????????
                 * ??¢?´¢?????????
                 * log(np+" -> "+target); // This line was commented out in the original, likely for debugging.
                 * ???????°????
                 */
                // Mark the edge (np, target) as used in both directions to prevent re-processing as a back-edge.
                used_e[ np ][ target ] = true;
                used_e[ target ][ np ] = true;

                dfs( target ); // Recursively call DFS on the unvisited target node.

                /*
                 * Original comments in Japanese:
                 * ?????\????????????lowlink?????????
                 * ???????????????????±????lowlink???????°???????lowlink????????¨??????
                 */
                // After the recursive call returns, update the low-link value of the current node.
                // It's the minimum of its current low-link and the low-link of its child (target).
                lowlink[ np ] = Math.min( lowlink[ np ], lowlink[ target ] );
            }
            // Case 2: The target node has already been visited AND the edge (target, np) has not been used.
            // This indicates a back-edge to an ancestor in the DFS tree, not the direct parent.
            else if ( !used_e[ target ][ np ] )
            {
                /*
                 * Original comments in Japanese:
                 * ?????????
                 * lowlink?????´??°
                 * ????°????????????????
                 * log(np+" => "+target); // This line was commented out in the original, likely for debugging.
                 */
                // Update the low-link value of the current node.
                // It's the minimum of its current low-link and the discovery time of the ancestor (target).
                lowlink[ np ] = Math.min( lowlink[ np ], ord[ target ] );
            }
        } );
    }


    // Initiates the DFS traversal starting from vertex 0.
    // This assumes the graph is connected or we are interested in bridges within the component of vertex 0.
    dfs( 0 );

    /*
     * Original comments in Japanese, likely for debugging purposes:
     * log(ord);
     * log(lowlink);
     */


    // After DFS, iterate through the original list of edges to identify actual bridges.
    lines.forEach( function ( edge )
    {
        var u = edge[ 0 ]; // First vertex of the current edge.
        var v = edge[ 1 ]; // Second vertex of the current edge.

        // Standardizes the edge (u, v) such that 'u' always has a smaller discovery order than 'v'.
        // This simplifies the bridge condition check.
        if ( ord[ u ] > ord[ v ] )
        {
            var k = u; // Temporary variable for swapping.
            u = v;
            v = k;
        }

        // Bridge detection condition: If the discovery time of 'u' is strictly less than
        // the low-link value of 'v', then the edge (u, v) is a bridge.
        // This means 'v' and its subtree cannot reach 'u' or an ancestor of 'u'
        // without traversing the edge (u,v).
        if ( ord[ u ] < lowlink[ v ] )
        {
            /*
             * Original comment in Japanese:
             * ????????????
             */
            // A bridge is found. Store it in a canonical form (min_vertex, max_vertex).
            var min = Math.min( u, v );
            var max = Math.max( u, v );
            bridges[ min ].push( max ); // Add 'max' to the list of bridges starting from 'min'.
        }
    } );


    // Sorts the list of bridge endpoints for each starting vertex.
    // This ensures consistent output order for bridges.
    bridges = bridges.map( function ( e )
    {
        return e.sort( );
    } );


    // Finally, iterate through the collected bridges and print them to the console.
    for ( var s = 0 ; s < V ; s++ )
    {
        var len = bridges[ s ].length; // Get the number of bridges starting from vertex 's'.
        for ( var td = 0 ; td < len ; td++ )
        {
            var t = bridges[ s ][ td ]; // Get the other endpoint of the bridge.
            log( s + " " + t );         // Print the bridge as "vertex1 vertex2".
        }
    }

} // End of the main function.