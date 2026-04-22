/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain identical.
 * Only whitespace and comments have been modified extensively
 * to create a visually different but functionally equivalent version.
 */


// The 'input' parameter receives the entire input data as an array of strings.
function Main ( input ) {
    // Parse N and M from the first line of input.
    // N represents the number of nodes, M represents the number of edges.
    var N = input [ 0 ] . split ( " " ) [ 0 ] - 0 ; // Convert string to number
    var M = input [ 0 ] . split ( " " ) [ 1 ] - 0 ; // Convert string to number

    // Initialize an adjacency list to store the graph.
    // Each key 'a' will map to an object, where keys are 'b' and values are edge indices.
    var list = { } ;

    // Populate the adjacency list with M edges.
    // Edges are stored in both directions for an undirected graph.
    for ( var i = 1 ; i <= M ; i++ ) {
        var a = input [ i ] . split ( " " ) [ 0 ] - 0 ; // First node of the edge
        var b = input [ i ] . split ( " " ) [ 1 ] - 0 ; // Second node of the edge

        // Ensure the nodes exist as keys in the list, initializing them if they don't.
        list [ a ] = list [ a ] || { } ;
        list [ b ] = list [ b ] || { } ;

        // Store the edge index 'i' for both directions (a to b, and b to a).
        list [ a ] [ b ] = i ;
        list [ b ] [ a ] = i ;
    }

    // Initialize a counter for the answer.
    // This will count the number of 'critical' edges.
    var ans = 0 ;

    // Iterate through each edge to check if removing it disconnects the graph.
    for ( var i = 1 ; i <= M ; i++ ) {
        // The 'check' function performs a traversal, excluding the current edge 'i'.
        // If the number of reachable nodes is not equal to N (total nodes),
        // it means removing edge 'i' disconnected the graph.
        if ( check ( list , i ) != N ) ans++ ;
    }

    // Output the final count of critical edges.
    console . log ( ans ) ;
}


// The 'check' function performs a Breadth-First Search (BFS) or Depth-First Search (DFS)
// to count the number of reachable nodes starting from node 1,
// while intentionally skipping a specific edge identified by 'skipEdgeIndex'.
function check ( list , skipEdgeIndex ) {
    // Initialize a stack (or queue for BFS) for traversal. Start from node 1.
    var stack = [ 1 ] ;

    // Keep track of visited nodes.
    var checked = { } ;

    // Continue traversal as long as there are nodes in the stack.
    while ( stack . length > 0 ) {
        // Pop the current node from the stack.
        var now = stack . splice ( 0 , 1 ) [ 0 ] ;

        // If the current node has already been visited, skip it.
        if ( checked [ now ] ) continue ;

        // Mark the current node as visited.
        checked [ now ] = true ;

        // Get all neighbors of the current node.
        var next = Object . keys ( list [ now ] ) ;

        // Iterate over each neighbor.
        next . forEach ( nxt => {
            // Only traverse to the neighbor if the edge connecting 'now' and 'nxt'
            // is NOT the one we are supposed to skip.
            if ( list [ now ] [ nxt ] != skipEdgeIndex ) {
                stack . push ( nxt ) ; // Add the neighbor to the stack for further traversal.
            }
        } ) ;
    }

    // Return the total count of unique nodes visited.
    // This represents the size of the connected component.
    return Object . keys ( checked ) . length ;
}


// Main execution block:
// Reads input from standard input, processes it, and calls the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ) ;