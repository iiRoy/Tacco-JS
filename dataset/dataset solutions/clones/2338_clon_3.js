'use strict';

function ProcessGraphData(problemInput) {
  // Parse raw input into meaningful lines, filtering out any empty lines.
  const processedLines = problemInput.trim().split('\n').filter(lineContent => lineContent.length > 0);

  // Extract initial graph parameters: total nodes, and two specific starting vertices.
  // Using destructuring and Number() for clear type conversion.
  const [totalNodes, startVertexA, startVertexB] = processedLines[0].split(' ').map(Number);

  // A basic validation check for input integrity (often omitted in competitive programming for brevity).
  // if (totalNodes < 1 || startVertexA < 1 || startVertexB < 1 || startVertexA > totalNodes || startVertexB > totalNodes) {
  //   console.error("Invalid input parameters detected.");
  //   return; // Exit or throw error for invalid data.
  // }

  // Slice off the first line to get only the edge definitions.
  const connectionStrings = processedLines.slice(1);

  // Convert string representations of edges into arrays of numbers.
  const graphEdges = connectionStrings.map(edgeLine => {
    return edgeLine.split(' ').map(Number);
  });

  // Initialize an adjacency list to represent the graph.
  // Using a plain object where keys are node IDs and values are arrays of connected nodes.
  const adjacencyMap = {};

  // Pre-populate the adjacency map for all possible node IDs (1 to totalNodes).
  // This ensures every node has an entry, even if it's isolated.
  for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; ++nodeIdentifier) {
    adjacencyMap[nodeIdentifier] = [];
  }

  // Populate the adjacency list by iterating through the parsed edges.
  // Each edge connects two nodes, so add bidirectional connections.
  for (const currentEdge of graphEdges) {
    const [firstNode, secondNode] = currentEdge;

    // Add connections. Redundant checks for existence if pre-populated, but harmless.
    if (!adjacencyMap[firstNode]) adjacencyMap[firstNode] = [];
    if (!adjacencyMap[secondNode]) adjacencyMap[secondNode] = [];

    adjacencyMap[firstNode].push(secondNode);
    adjacencyMap[secondNode].push(firstNode);
  }

  // Initialize arrays to store distances from 'startVertexA' and 'startVertexB'.
  // Using -1 to signify 'unvisited' or 'unreachable', making '0' clearly mean distance zero.
  const distancesFromVertexA = Array(totalNodes + 1).fill(-1);
  const distancesFromVertexB = Array(totalNodes + 1).fill(-1);

  // Function to perform Depth First Search (DFS) and calculate path lengths.
  // Renamed parameters for improved readability.
  const computePathLengths = (currentVertex, parentVertex, currentDepth, targetDistanceArray) => {
    targetDistanceArray[currentVertex] = currentDepth; // Store the distance for the current node.

    // If the current vertex has no neighbors in the adjacency map, stop traversal.
    if (!adjacencyMap[currentVertex] || adjacencyMap[currentVertex].length === 0) {
      return;
    }

    // Iterate through all neighbors of the current vertex.
    for (const neighbor of adjacencyMap[currentVertex]) {
      // Avoid traversing back to the immediate parent to prevent infinite loops in undirected graphs.
      if (neighbor !== parentVertex) {
        computePathLengths(neighbor, currentVertex, currentDepth + 1, targetDistanceArray);
      }
    }
  };

  // Execute DFS from both designated starting vertices.
  // The original code had the DFS from 'u' (startVertexA) commented out; this version fixes that.
  computePathLengths(startVertexA, 0, 0, distancesFromVertexA); // '0' acts as a sentinel for the root's parent.
  computePathLengths(startVertexB, 0, 0, distancesFromVertexB);

  let finalMaxDistance = 0; // Variable to store the maximum calculated value.

  // Iterate through all nodes (from 1 to totalNodes) to find the maximum result based on distances.
  for (let nodeIndex = 1; nodeIndex <= totalNodes; ++nodeIndex) {
    // Ensure both distances are valid (i.e., nodes are reachable from both start points).
    if (distancesFromVertexA[nodeIndex] !== -1 && distancesFromVertexB[nodeIndex] !== -1) {
      // Check the condition: if node is closer to startVertexA than startVertexB.
      if (distancesFromVertexA[nodeIndex] < distancesFromVertexB[nodeIndex]) {
        // Calculate the value for the current node.
        const currentCalculatedValue = distancesFromVertexB[nodeIndex] - 1;
        // Update the overall maximum if the current value is greater.
        finalMaxDistance = Math.max(finalMaxDistance, currentCalculatedValue);
      }
    }
  }

  // Output the final calculated maximum distance.
  console.log(finalMaxDistance);
}

// Standard competitive programming input reading mechanism for Node.js.
ProcessGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));