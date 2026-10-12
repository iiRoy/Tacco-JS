'use strict' ;
var  dataStream  = require ( "node:fs" ) . readFileSync ( "/dev/stdin" ,  "utf-8" ) ;
var  inputQueue  = dataStream . trim ( ) . split ( / |\n/ ) ,  cursorIndex  = 0 ;

function  processGraph ( ) {
    // Read the total number of nodes (N) and edges (M) from the input stream.
    let  nodeCount  = + inputQueue . shift ( ) ;
    let  edgeCount  = + inputQueue . shift ( ) ;

    let  nodeA ;
    let  nodeB ;

    // Initialize an adjacency list to represent the graph connections.
    let  adjacencyList  = Array ( nodeCount + 1 ) ;
    for  ( let  idx  = 0 ;  idx  < nodeCount + 1 ;  idx ++ ) {
        adjacencyList [ idx ] = [ ] ;
    }

    // Populate the adjacency list by reading M edge pairs.
    // Each edge connects two nodes, so add to both nodes' lists.
    for  ( let  idx  = 0 ;  idx  < edgeCount ;  idx ++ ) {
        nodeA  = + inputQueue . shift ( ) ;
        nodeB  = + inputQueue . shift ( ) ;
        adjacencyList [ nodeA ] . push ( nodeB ) ;
        adjacencyList [ nodeB ] . push ( nodeA ) ;
    }

    // Prepare an array to store the parent of each node in the BFS tree.
    let  resultPath  = Array ( nodeCount + 1 ) ;
    resultPath [ 0 ] = "Yes" ; // Special marker for the first line of output.

    // Keep track of visited nodes to avoid cycles and redundant processing.
    let  unvisitedNodes  = Array ( nodeCount + 1 ) . fill ( true ) ; // Initially all nodes are unvisited.
    unvisitedNodes [ 1 ] = false ; // Mark node 1 as visited, as it's the starting point.
    let  pendingCount  = nodeCount - 1 ; // Number of nodes remaining to be visited.
    let  currentLayer  = [ 1 ] ; // Start BFS from node 1.

    // Perform a Breadth-First Search (BFS) to find parent nodes for all reachable nodes.
    while  ( pendingCount  > 0 ) {
        let  nextLayer  = [ ] ; // Nodes discovered in the current layer, for the next iteration.
        currentLayer . forEach ( currentNode => {
            adjacencyList [ currentNode ] . forEach ( neighborNode => {
                if  ( unvisitedNodes [ neighborNode ] ) {
                    resultPath [ neighborNode ] = currentNode ; // Assign 'currentNode' as parent of 'neighborNode'.
                    unvisitedNodes [ neighborNode ] = false ; // Mark neighbor as visited.
                    pendingCount -- ; // Decrement count of pending nodes.
                    nextLayer . push ( neighborNode ) ; // Add neighbor to the next layer for exploration.
                }
            } ) ;
        } ) ;
        currentLayer  = nextLayer ; // Advance to the next level of nodes.
    }

    // Adjust the result array: `resultPath[0]` is "Yes", `resultPath[1]` is unused.
    // Remove the unused element at index 1 to align parents with their respective output lines.
    resultPath . splice ( 1 , 1 ) ;
    console . log ( resultPath . join ( "\n" ) ) ; // Output the final path, each element on a new line.
}
processGraph ( ) ; // Execute the graph processing function.