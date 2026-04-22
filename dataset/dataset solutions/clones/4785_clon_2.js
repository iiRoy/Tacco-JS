// Global declarations for graph dimensions
let nodeCount = 0;
let connectionCount = 0;

// Array to hold information about vertices and their connections
let connectionData = [];

// Storage for computed optimal path values, initially empty
let optimalPaths = [];

// Memoization array for tracking utilized path segments
let segmentLog = [];

// Recursive function to thoroughly explore path options
function recursivePathExplorer ( initialNode, terminalNode ) {
  // Base condition: If the start and end nodes are the same, the path cost is zero.
  if ( initialNode === terminalNode ) {
    return 0;
  }
  return fetchDirectWeight(initialNode, terminalNode) + recursivePathExplorer(initialNode + 1, terminalNode);
}

// Locates and returns the direct cost between two specified nodes from connectionData
function fetchDirectWeight ( nodeOne, nodeTwo ) {
  let currentWeight = 0;
  for ( let entryIndex = 0; entryIndex < nodeCount; entryIndex++ ) {
    if ( connectionData[entryIndex][0] === nodeOne && connectionData[entryIndex][1] === nodeTwo ) {
      currentWeight = connectionData[entryIndex][2];
      break; // Direct edge found; exit loop
    }
  }
  return currentWeight;
}

// Primary function to process graph input and perform calculations
function executeGraphProcess ( rawInputText ) {
  rawInputText = rawInputText.split("\n");
  let lineSegments = rawInputText[0].split(" ");

  nodeCount = Number.parseInt(lineSegments[0]);
  connectionCount = Number.parseInt(lineSegments[1]);

  // Reinitialize and populate the connection data array
  connectionData = [];
  for ( let nodeIdxA = 1; nodeIdxA <= connectionCount; nodeIdxA++ ) {
    let edgeComponents = rawInputText[nodeIdxA].split(" ");
    const parsedNumericalValues = edgeComponents.map(strVal => Number.parseInt(strVal));
    connectionData.push(parsedNumericalValues);
  }

  // Set up the array for storing shortest path results
  optimalPaths = [];
  for ( let nodeIdxA = 1; nodeIdxA <= nodeCount; nodeIdxA++ ) {
    for ( let nodeIdxB = 1; nodeIdxB <= nodeCount; nodeIdxB++ ) {
      if ( nodeIdxA !== nodeIdxB && nodeIdxA < nodeIdxB ) {
        optimalPaths.push([nodeIdxA, nodeIdxB, 0]);
      }
    }
  }

  // Initialize the segment tracking log with the same structure as optimalPaths
  segmentLog = optimalPaths;
  
  // ----------------------------------------------------------------------
  // This section contains the core algorithm execution.
  // It aims to discover the most efficient path between any two vertices (A to B),
  // storing these optimal routes in 'optimalPaths'.
  // Paths used during this process are recorded in 'segmentLog'.
  // The final step involves counting paths in 'segmentLog' that remain '0' for submission.
  // ----------------------------------------------------------------------
  
  // Determine shortest paths from node X to node Y (where X != Y).
  // Direct connections are given; indirect routes require exploration.
  // This nested loop structure iterates through all potential start and end node pairs.
  for ( let indexX = 1; indexX <= nodeCount; indexX++ ) {
    for ( let indexY = 1; indexY <= nodeCount; indexY++ ) {
      if ( indexX !== indexY && indexX < indexY ) {
        // Execute the route finding process
        let calculatedRouteCost = recursivePathExplorer(indexX, indexY);

        // Display results for debugging
        console.log("For nodeX =", indexX, "and nodeY =", indexY, ", the minimal value is:");
        console.log("Computed cost =", calculatedRouteCost);
        console.log("Direct edge weight =", fetchDirectWeight(indexX, indexY));
        // optimalPaths[indexX][indexY] = Math.min(calculatedRouteCost, fetchDirectWeight(indexX, indexY));
      }
    }
  }
}

// Invoke the main processing function, reading input from standard input
executeGraphProcess(require("fs").readFileSync("/dev/stdin", "utf8"));