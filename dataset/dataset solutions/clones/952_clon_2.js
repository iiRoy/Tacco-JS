( function  programExecution( )
{
  // This section is responsible for reading and preprocessing the entire input stream.
  // It retrieves content from standard input, cleans it, and segments it into an array of lines.
  const inputContent = require('fs')
                  .readFileSync('/dev/stdin', 'utf8') // Reads the full file content as a UTF-8 string.
                  .trim()                            // Removes any leading or trailing whitespace characters.
                  .split('\n');                      // Divides the string into an array of lines based on newline characters.

  // The very first line of the input typically contains the graph's fundamental dimensions:
  // the total number of nodes (vertices) and the total number of edges.
  const [ nodeCount, edgeCount ] = inputContent.shift().split(' ').map(Number);

  // Initialize the graph's adjacency list structure.
  // 'graphAdjacencies' will be an array where each index corresponds to a node,
  // and its value is an array of nodes directly connected to it.
  const graphAdjacencies = Array.from(Array(nodeCount), () => []);

  // This variable is declared for structural consistency but is not actively used
  // in the current implementation of the graph traversal logic.
  const distancesArray = [];

  let startVertex, endVertex; // Temporary variables to hold the identifiers of nodes forming an edge.

  // Iterate through the next 'edgeCount' lines in the input. Each of these lines
  // describes a single edge connecting two nodes within the graph.
  for ( let loopIterator = 0; loopIterator < edgeCount; loopIterator++ )
  {
    [ startVertex, endVertex ] = inputContent.shift().split(' ').map(Number);
    // Since this graph is considered undirected, an edge from A to B implies
    // an edge from B to A. We add both connections to the respective adjacency lists.
    graphAdjacencies[startVertex].push(endVertex); // Adds 'endVertex' to 'startVertex's' list of neighbors.
    graphAdjacencies[endVertex].push(startVertex); // Adds 'startVertex' to 'endVertex's' list of neighbors.
  }

  // Define symbolic constants to represent the various states a node can be in
  // during a graph traversal algorithm (e.g., Breadth-First Search).
  const UNVISITED_NODE = 0, VISITING_NODE = 1, VISITED_NODE = 2;

  let currentElement, neighborElement, traversalQueue; // Variables used to manage the BFS process.

  /**
   * Conducts a Breadth-First Search (BFS) to ascertain if a path exists
   * between two specified nodes within the constructed graph.
   *
   * @param {number} sourceId - The unique identifier of the starting node for the search.
   * @param {number} targetId - The unique identifier of the destination node to reach.
   * @returns {boolean} Returns 'true' if a path is successfully discovered from 'sourceId' to 'targetId';
   *                    otherwise, returns 'false' indicating no such path exists.
   */
  function checkPathExistence(sourceId, targetId)
  {
    // Initialize an array to maintain the visitation state for every node in the graph.
    // Initially, all nodes are marked as UNVISITED_NODE.
    const nodeStateTracker = Array.from(graphAdjacencies, () => UNVISITED_NODE);

    traversalQueue = [sourceId]; // Begin the BFS by placing the 'sourceId' into the queue.

    // Continue the search process as long as there are nodes remaining in the queue to explore.
    while ( ( currentElement = traversalQueue.shift() ) !== undefined )
    {
      // Iterate through each node that is directly connected to the 'currentElement'.
      for ( let loopIterator = 0; loopIterator < graphAdjacencies[currentElement].length; loopIterator++ )
      {
        neighborElement = graphAdjacencies[currentElement][loopIterator];

        // If the 'neighborElement' happens to be our 'targetId', a path has been found.
        if ( neighborElement === targetId ) return true;

        // If this 'neighborElement' has not been visited yet, mark it and add it to the queue
        // for subsequent exploration.
        if ( nodeStateTracker[neighborElement] === UNVISITED_NODE )
        {
          nodeStateTracker[neighborElement] = VISITING_NODE; // Mark the node as being processed.
          traversalQueue.push(neighborElement);              // Enqueue the neighbor for future visits.
        }
      }
      nodeStateTracker[currentElement] = VISITED_NODE; // Once all neighbors are processed, mark 'currentElement' as fully visited.
    }
    return false; // If the queue becomes empty and the 'targetId' was never reached, no path exists.
  }

  // After the graph's structure has been fully processed, the next line in the input
  // typically serves as a separator before the connectivity queries begin. This line is discarded.
  inputContent.shift();

  // Process each of the remaining lines in 'inputContent'. Each line represents a query
  // to check for connectivity between two nodes.
  console.log(
    inputContent.map(
      queryEntry => checkPathExistence(...queryEntry.split(' ').map(Number)) ? 'path_found' : 'no_path'
    ).join('\n') // Joins all the individual query results with newline characters for final output.
  );

} ) ( );