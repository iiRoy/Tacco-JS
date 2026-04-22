const calculateScalarProduct = (firstVector, secondVector) => {
  if (firstVector.length !== secondVector.length) {
    console.error("Scalar product error: Input vectors must have identical lengths.");
    return 0;
  }

  let accumulatedValue = 0;
  for (let vectorElementIndex = 0; vectorElementIndex < firstVector.length; vectorElementIndex++) {
    const termProduct = firstVector[vectorElementIndex] * secondVector[vectorElementIndex];
    accumulatedValue += termProduct;
  }
  return accumulatedValue;
};

const applyVectorTransformation = (vectorAlpha, vectorBeta) => {
  if (vectorAlpha.length !== vectorBeta.length) {
    console.error("Vector transformation error: Vectors must have identical lengths.");
    return;
  }

  for (let elementPosition = 0; elementPosition < vectorAlpha.length; elementPosition++) {
    // Store the original values for clarity in the transformation steps
    const originalAlphaValue = vectorAlpha[elementPosition];
    const originalBetaValue = vectorBeta[elementPosition];

    // Step 1: Update vectorAlpha element
    vectorAlpha[elementPosition] = originalAlphaValue + originalBetaValue;

    // Step 2: Update vectorBeta element using the *new* value from vectorAlpha
    vectorBeta[elementPosition] = originalBetaValue + vectorAlpha[elementPosition];
  }
};

const analyzeGraphConnectivity = (graphInputString) => {
  // Parse the raw input string, splitting by newlines and spaces, then converting to numbers.
  // Filters out any empty lines that might result from extra newlines.
  const parsedDataLines = graphInputString
    .split(/\s*\n\s*/)
    .filter(line => line.trim() !== '')
    .map(line => line.split(/\s+/).map(Number));

  // Validate the initial input structure for N (nodes) and M (edges)
  if (parsedDataLines.length === 0 || parsedDataLines[0].length < 2) {
    console.error("Input format error: Missing N and M values on the first line.");
    return;
  }

  const numberOfNodes = parsedDataLines[0][0];
  const numberOfEdges = parsedDataLines[0][1];

  // Additional validation for graph dimensions
  if (numberOfNodes <= 0) {
    console.error("Graph dimension error: Number of nodes (N) must be a positive integer.");
    return;
  }
  if (numberOfEdges < 0) {
    console.error("Graph dimension error: Number of edges (M) cannot be negative.");
    return;
  }
  if (numberOfEdges > parsedDataLines.length - 1) {
      console.warn(`Input warning: Expected ${numberOfEdges} edge lines, but only found ${parsedDataLines.length - 1}.`);
  }


  // Initialize the adjacency matrix for graph representation.
  // All connections are initially zero (no direct link).
  let adjacencyMatrix = Array.from({ length: numberOfNodes }, () => Array(numberOfNodes).fill(0));

  // Establish self-connections: Each node is considered connected to itself.
  // This is often a prerequisite for certain graph operations or problem definitions.
  for (let nodeIndex = 0; nodeIndex < numberOfNodes; nodeIndex++) {
    adjacencyMatrix[nodeIndex][nodeIndex] = 1;
  }

  // Populate the adjacency matrix based on the provided edge list.
  // Input nodes are 1-indexed, so we convert them to 0-indexed for array access.
  for (let edgeCounter = 1; edgeCounter <= numberOfEdges; edgeCounter++) {
    if (edgeCounter >= parsedDataLines.length) {
        console.warn(`Input error: Edge data for edge number ${edgeCounter} is missing. Terminating edge processing.`);
        break;
    }

    const currentEdgeData = parsedDataLines[edgeCounter];
    if (currentEdgeData.length < 2) {
        console.warn(`Input error: Malformed edge data on line ${edgeCounter + 1}. Skipping this edge.`);
        continue;
    }

    const nodeA = currentEdgeData[0];
    const nodeB = currentEdgeData[1];

    // Validate node indices to ensure they are within the graph's bounds.
    if (nodeA < 1 || nodeA > numberOfNodes || nodeB < 1 || nodeB > numberOfNodes) {
        console.warn(`Input error: Invalid node indices (${nodeA}, ${nodeB}) for an edge. Skipping.`);
        continue;
    }

    // Mark connections in both directions for an undirected graph.
    adjacencyMatrix[nodeA - 1][nodeB - 1] = 1;
    adjacencyMatrix[nodeB - 1][nodeA - 1] = 1;
  }

  // Apply a specialized iterative transformation across all node pairs.
  // This step modifies the adjacency matrix based on shared connection patterns.
  // If two nodes' connection vectors have a non-zero scalar product (i.e., they share
  // at least one common neighbor or self-loop), their connection patterns are transformed.
  for (let currentRowIdx = 0; currentRowIdx < numberOfNodes; currentRowIdx++) {
    for (let otherRowIdx = 0; otherRowIdx < numberOfNodes; otherRowIdx++) {
      // Check for overlap in connection patterns between two rows/vectors.
      if (calculateScalarProduct(adjacencyMatrix[currentRowIdx], adjacencyMatrix[otherRowIdx]) !== 0) {
        // If there's overlap, apply the in-place vector transformation.
        applyVectorTransformation(adjacencyMatrix[currentRowIdx], adjacencyMatrix[otherRowIdx]);
      }
    }
  }

  // Identify distinct connected components within the graph based on the modified adjacency matrix.
  const identifiedComponents = []; // Stores arrays of nodes for each component.
  const nodeVisitationTracker = new Set(); // Efficiently tracks visited nodes.

  // Iterate through all nodes to ensure each is assigned to a component.
  for (let startingNodeIdx = 0; startingNodeIdx < numberOfNodes; startingNodeIdx++) {
    // If a node hasn't been visited yet, it signifies the start of a new, undiscovered component.
    if (!nodeVisitationTracker.has(startingNodeIdx)) {
      const currentComponentNodes = []; // Nodes belonging to the component being discovered.
      const nodesToProcessQueue = [startingNodeIdx]; // Queue for BFS-like traversal.
      nodeVisitationTracker.add(startingNodeIdx); // Mark the starting node as visited.

      // Perform a Breadth-First Search (BFS) or similar traversal to find all reachable nodes.
      while (nodesToProcessQueue.length > 0) {
        const currentNode = nodesToProcessQueue.shift(); // Get the next node to explore.
        currentComponentNodes.push(currentNode); // Add it to the current component.

        // Explore all potential neighbors of the current node.
        for (let neighborCandidateIdx = 0; neighborCandidateIdx < numberOfNodes; neighborCandidateIdx++) {
          // If there's a connection (non-zero value in the matrix)
          // and the neighbor hasn't been visited yet, add it to the queue.
          if (adjacencyMatrix[currentNode][neighborCandidateIdx] !== 0 && !nodeVisitationTracker.has(neighborCandidateIdx)) {
            nodeVisitationTracker.add(neighborCandidateIdx); // Mark the neighbor as visited.
            nodesToProcessQueue.push(neighborCandidateIdx); // Add to queue for further exploration.
          }
        }
      }
      // Once all nodes reachable from startingNodeIdx are found, add the component to the list.
      identifiedComponents.push(currentComponentNodes);
    }
  }

  // The problem's final output is often the number of components minus one,
  // which can relate to the minimum number of connections needed to link all components.
  const finalResultValue = identifiedComponents.length - 1;

  // Display the computed result to standard output.
  console.log(finalResultValue);
};

// Entry point for the application: Reads input from stdin and processes it.
// Uses a try-catch block for robust error handling during file reading.
try {
  const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
  analyzeGraphConnectivity(fileData);
} catch (ioError) {
  console.error("Input/Output Error: Failed to read from /dev/stdin.", ioError.message);
  // In a production environment, you might want to exit the process or provide a default.
  // process.exit(1);
}