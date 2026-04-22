const STATE_UNVISITED = 0;
const STATE_VISITED = 1;

const LARGE_NUMERIC_VALUE = 999999999; // Represents an effectively infinite cost or distance


(function processGraphData() { // Encapsulates the main graph processing logic.

  // Retrieves raw input from a designated file, processes it, and splits into individual lines.
  const graphInputLines = require('fs')
    .readFileSync('/input/data.txt', 'utf-8') // Read the file content using UTF-8 encoding.
    .trim()                                   // Remove any leading or trailing whitespace from the input string.
    .split('\n');                             // Divide the content into an array of strings, one per line.


  // Extracts the total number of vertices from the first line of the input.
  const vertexCount = Number(graphInputLines.shift());


  // Transforms the remaining input lines into an adjacency matrix representing edge weights.
  // A value of -1 in the input is converted to LARGE_NUMERIC_VALUE, signifying no direct edge.
  const edgeWeightsMatrix = graphInputLines.map(
    (entryStr, rowIdx) =>
      entryStr.trim()
        .split(' ')
        .map(cellStr =>
          cellStr == -1 && LARGE_NUMERIC_VALUE || Number(cellStr)
        )
  );


  // Generates an array of numerical indices from 0 up to (vertexCount - 1).
  const vertexIndexList = Array.from(Array(vertexCount), (val, idx) => idx);


  // Initializes data structures required for the algorithm.
  // shortestPaths: Stores the minimum known cost to reach each vertex.
  // nodeStates: Records whether each vertex has been processed/visited.
  const shortestPaths = [];
  const nodeStates = [];
  for (let loopVar = 0; loopVar < vertexCount; loopVar++) {
    shortestPaths[loopVar] = LARGE_NUMERIC_VALUE; // All paths start as "infinite".
    nodeStates[loopVar] = STATE_UNVISITED;       // All nodes are initially unvisited.
  }
  shortestPaths[0] = 0; // The cost to the starting vertex (index 0) is zero.


  // Variables to hold the state during the Prim's algorithm execution.
  let currentMinWeight;     // The smallest edge weight found in the current iteration.
  let chosenVertex;         // The index of the vertex selected in the current step.
  let totalWeightSum = 0;   // Accumulates the total weight of the Minimum Spanning Tree.


  // The core loop of Prim's algorithm. It continues until all reachable vertices are included.
  while (true) {

    // Finds the unvisited vertex with the minimum `shortestPaths` value.
    currentMinWeight = vertexIndexList.reduce((accumulatedMin, currentVertexIdx) => {
      if (nodeStates[currentVertexIdx] === STATE_VISITED || shortestPaths[currentVertexIdx] >= accumulatedMin) {
        return accumulatedMin;
      }
      return shortestPaths[chosenVertex = currentVertexIdx]; // Updates 'chosenVertex' and returns its path cost.
    }, LARGE_NUMERIC_VALUE); // The initial comparison value for reduction is a large number.


    // If no more reachable unvisited vertices exist, the MST construction is complete.
    if (currentMinWeight === LARGE_NUMERIC_VALUE) {
      break;
    }


    // Adds the cost of the newly selected edge/vertex to the overall MST weight.
    totalWeightSum += currentMinWeight;
    // Marks the currently chosen vertex as visited.
    nodeStates[chosenVertex] = STATE_VISITED;


    // Iterates through all neighbors of the newly chosen vertex to update their potential shortest paths.
    edgeWeightsMatrix[chosenVertex].forEach((neighborCost, neighborIdx) => {
      // If a neighbor is unvisited and a shorter path to it is found via 'chosenVertex', update its shortest path.
      if (nodeStates[neighborIdx] !== STATE_VISITED && shortestPaths[neighborIdx] > neighborCost) {
        shortestPaths[neighborIdx] = neighborCost;
      }
    });

  }

  // Prints the final calculated total weight of the Minimum Spanning Tree to the console.
  console.log(totalWeightSum);

})();