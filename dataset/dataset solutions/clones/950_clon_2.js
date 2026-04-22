/*
  This script processes graph data to determine connectivity between nodes.
  It reads graph structure from standard input, then executes multiple path queries.
*/
( function processGraphQueries ( )
{

  const inputContentRows = require('fs') . readFileSync( '/dev/stdin' , 'utf8' ) . trim() . split( '\n' ) ;

  // Extract the total number of nodes and edges from the first line of input.
  const [ graphNodeCount , graphEdgeCount ] = inputContentRows . shift() . split( ' ' ) . map( Number ) ;

  // Initialize the adjacency list structure for the graph. Each node gets an empty array for its connections.
  const graphConnections = new Array( graphNodeCount ) . fill( null ) . map( ( ) => new Array ( ) ) ;

  const extraDataPlaceholder = [ ] ; // This array is declared but remains unused in the current logic.

  let edgeStartPoint, edgeEndPoint ;

  // Loop through the input to read and add each edge to the graph's adjacency list.
  for ( let loopIndex = 0 ; loopIndex < graphEdgeCount ; loopIndex ++ )
  {
    [ edgeStartPoint, edgeEndPoint ] = inputContentRows . shift() . split( ' ' ) . map( Number ) ;
    graphConnections[ edgeStartPoint ] . push( edgeEndPoint ) ;
    graphConnections[ edgeEndPoint ] . push( edgeStartPoint ) ; // Assuming an undirected graph, add reverse connection.
  }


  /**
   * Performs a Breadth-First Search (BFS) to check for a path between two specified nodes.
   * @param {number} sourceNodeId - The identifier of the starting node for the path search.
   * @param {number} destinationNodeId - The identifier of the target node to reach.
   * @returns {boolean} Returns `true` if a path is found, otherwise `false`.
   */
  function checkConnectivity ( sourceNodeId, destinationNodeId )
  {
    const STATE_UNVISITED = 0x0 ;  // Node has not been discovered or added to the queue yet.
    const STATE_EXPLORING = 0x1 ;  // Node has been added to the queue and is awaiting processing.
    const STATE_EXPLORED  = 0x2 ;  // Node has been fully processed (all its neighbors checked).

    // Create an array to maintain the visit status for all nodes, initially marking them as unvisited.
    const nodeVisitStates = new Array( graphConnections.length ) . fill ( STATE_UNVISITED ) ;

    let bfsQueue = [ sourceNodeId ] ; // Start the BFS traversal with the initial source node.
    let currentNodeIdentifier, neighborIdentifier ;

    // Continue the BFS process as long as there are nodes remaining in the queue to be explored.
    while ( ( currentNodeIdentifier = bfsQueue . shift() ) !== undefined )
    {

      // Iterate over all nodes directly connected to the current node.
      for ( let neighborLoopIndex = 0 ; neighborLoopIndex < graphConnections[currentNodeIdentifier].length ; neighborLoopIndex ++ )
      {
        neighborIdentifier = graphConnections[currentNodeIdentifier][neighborLoopIndex] ;

        // If the current neighbor is the destination node, a path has been successfully found.
        if ( neighborIdentifier === destinationNodeId ) {
          return true ;
        }

        // If the neighbor node has not been visited yet, mark it for exploration and add it to the queue.
        if ( nodeVisitStates[neighborIdentifier] === STATE_UNVISITED ) {
          nodeVisitStates[neighborIdentifier] = STATE_EXPLORING ;
          bfsQueue . push( neighborIdentifier ) ;
        }
      }
    }
    return false ; // If the loop completes and the destination is not found, no path exists.
  }

  inputContentRows . shift( ) ; // Consume the line that acts as a separator or indicates query count.

  // Process each remaining line as a connectivity query and output 'yes' or 'no' for each.
  console . log (
    inputContentRows . map ( queryLineText => {
      const queryNodes = queryLineText . split( ' ' ) . map( Number ) ;
      return checkConnectivity ( ...queryNodes ) ? 'yes' : 'no' ;
    } ) . join( '\n' )
  ) ;

} ) ( ) ;