/*
 *  This self-executing function initiates the primary program flow.
 *  It handles input processing, graph construction, and execution of the traversal algorithm.
 */
( function applicationEntry ( ) {

  // Load the file system utility module for input operations.
  const inputContentRows = require ( 'fs' )
    .readFileSync ( '/dev/stdin' , 'UTF-8' ) // Read the entire content from standard input.
    .trim ( ) // Remove any leading or trailing whitespace from the raw input.
    .split ( String.fromCharCode(10) ) ; // Divide the content into an array of lines using newline character.

  /*
   * Extract the total number of nodes in the graph from the first line.
   * The 'shift()' method removes the first element from the array and returns it.
   */
  const graphNodeCount = parseInt ( inputContentRows.shift ( ) , 10 ) ;

  // Initialize an array of arrays to store the adjacency list representation of the graph.
  // Each inner array will hold the indices of nodes adjacent to the current node.
  const adjacencyRepresentations = Array.from ( { length: graphNodeCount } , ( ) => [ ] ) ;

  // Initialize an array to store the shortest distance from the source node to all other nodes.
  const distanceMetrics = [ ] ;

  /*
   * Iterate over the remaining input lines to populate the adjacency lists.
   * Each line describes a node and its neighbors.
   */
  inputContentRows . forEach ( ( currentLineSegment , indexPosition ) =>
    currentLineSegment
      .split ( String.fromCharCode(32) ) // Split the line by space to get individual elements.
      .splice ( 2 ) // Remove the first two elements (node ID and count of neighbors, which are not needed for adjacency list construction here).
      .forEach ( ( elementValueParsed ) => {
        // Convert neighbor string to integer and adjust to 0-based indexing before adding to the list.
        adjacencyRepresentations [ indexPosition ] . push ( parseInt ( elementValueParsed , 10 ) - 1 ) ;
      } )
  ) ;

  // Execute the Breadth-First Search algorithm on the constructed graph.
  performGraphTraversal ( adjacencyRepresentations , distanceMetrics ) ;

  /*
   * Output the calculated shortest distances for each node.
   * Node IDs are 1-based in the output, so add 1 to the 0-based index.
   */
  for ( let indexPosition = 0 ; indexPosition < graphNodeCount ; indexPosition ++ ) {
    console.log ( indexPosition + 1 , distanceMetrics [ indexPosition ] ) ;
  }

} ) ( ) ; // Immediately invoke the main application function.


/**
 *  Performs a Breadth-First Search (BFS) traversal starting from node 0.
 *  It calculates the shortest distance from the source node to all reachable nodes.
 * @param {Array<Array<number>>} graphStructure - The adjacency list representation of the graph.
 * @param {Array<number>} calculatedDistances - An array to store the shortest distances, modified in-place.
 */
function performGraphTraversal ( graphStructure , calculatedDistances ) {

  // Define constants for node visit states to improve readability.
  const UNVISITED_NODE = 0 , // Node has not been discovered yet.
        CURRENTLY_VISITING = 1 , // Node has been discovered and added to the queue.
        VISITED_COMPLETED = 2 ; // Node has been processed and all its neighbors checked.

  // Initialize an array to keep track of the state of each node (unvisited, visiting, visited).
  const nodeStateTracker = Array.from ( graphStructure , ( ) => UNVISITED_NODE ) ;

  // The distance to the starting node (node 0) is 0.
  calculatedDistances [ 0 ] = 0 ;

  /*
   * Initialize distances for all other nodes to -1, indicating they are unreachable
   * or not yet discovered.
   */
  for ( let currentIdx = 1 ; currentIdx < graphStructure.length ; currentIdx ++ ) {
    calculatedDistances [ currentIdx ] = -1 ;
  }

  // Create a queue for BFS, starting with the source node (node 0).
  const traversalQueue = [ 0 ] ;

  let activeNode ; // Variable to hold the node being currently processed from the queue.

  /*
   * Continue processing nodes from the queue until it is empty.
   * 'shift()' removes the first element and returns it.
   */
  while ( ( activeNode = traversalQueue.shift ( ) ) !== undefined ) {

    // Iterate over all neighbors of the current active node.
    graphStructure [ activeNode ] . forEach ( neighborNodeIdentifier => {
      // If a neighbor has not been visited yet.
      if ( nodeStateTracker [ neighborNodeIdentifier ] === UNVISITED_NODE ) {
        nodeStateTracker [ neighborNodeIdentifier ] = CURRENTLY_VISITING ; // Mark as currently visiting.
        calculatedDistances [ neighborNodeIdentifier ] = calculatedDistances [ activeNode ] + 1 ; // Update its distance.
        traversalQueue . push ( neighborNodeIdentifier ) ; // Add the neighbor to the queue for future processing.
      }
    } ) ;

    // Once all neighbors of the active node have been processed, mark it as fully visited.
    nodeStateTracker [ activeNode ] = VISITED_COMPLETED ;
  }
}