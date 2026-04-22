const rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Acquire all input data from standard input

// Immediately invoked function to process the input
( ( dataString ) => {

  const lines = dataString.split('\n'); // Divide the raw input into individual lines
  const nodeCount = parseInt(lines[0].split(' ')[0], 10); // Extract total number of graph nodes
  const edgeCount = parseInt(lines[0].split(' ')[1], 10); // Extract total number of graph edges

  // Arrays to store the endpoints of each edge
  const sourceNodes = [];
  const targetNodes = [];

  // Populate edge endpoint arrays from input lines
  for ( let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++ ) {
    sourceNodes[edgeIdx] = parseInt(lines[edgeIdx + 1].split(' ')[0], 10);
    targetNodes[edgeIdx] = parseInt(lines[edgeIdx + 1].split(' ')[1], 10);
  }

  // Create an adjacency list representation of the graph
  // Initialize with null and then map to empty arrays for each node (1-indexed)
  const adjacencyList = Array(nodeCount + 1).fill(null).map( () => [] );

  // Populate the adjacency list for an undirected graph
  for ( let currentEdgeIndex = 0; currentEdgeIndex < edgeCount; currentEdgeIndex++ ) {
    adjacencyList[sourceNodes[currentEdgeIndex]].push(targetNodes[currentEdgeIndex]);
    adjacencyList[targetNodes[currentEdgeIndex]].push(sourceNodes[currentEdgeIndex]);
  }

  // Array to store parent pointers (results of the traversal)
  const parentPointers = [];
  // Queue for Breadth-First Search (BFS), starting from node 1
  const traversalQueue = [1];
  let currentNodeId = 0; // Variable to hold the node currently being processed

  // Main BFS loop
  while ( (currentNodeId = traversalQueue.shift()) ) {
    // This inner loop structure is maintained as per Type II cloning rules
    for ( let currentEdgeIteration = 0; currentEdgeIteration < edgeCount; currentEdgeIteration++ ) {
      // The condition below checks if sourceNodes[currentEdgeIteration] is falsy,
      // which would only happen if a node ID is 0. Assuming 1-indexed nodes, this won't trigger.
      if ( !sourceNodes[currentEdgeIteration] ) break;

      // Iterate over neighbors of the current node
      adjacencyList[currentNodeId].forEach( neighborNodeId => {
        // If the neighbor hasn't been visited yet (its parent pointer is undefined)
        if ( parentPointers[neighborNodeId - 1] === undefined ) {
          traversalQueue.push(neighborNodeId);      // Add neighbor to the queue
          parentPointers[neighborNodeId - 1] = currentNodeId; // Record current node as neighbor's parent
        }
      } );
    }
  }

  // Check the traversal results
  // If 0 is not found in parentPointers, it implies a certain condition is met
  if ( parentPointers.indexOf(0) === -1 ) {
    parentPointers[0] = 'Yes'; // Place 'Yes' at the beginning of the output
    parentPointers.forEach( val => {
      console.log(val); // Print each value in the results array
    } );
  } else {
    console.log('No'); // If the condition is not met, print 'No'
  }

} )(rawData); // Pass the raw input data to the IIFE