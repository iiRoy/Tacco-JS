const rawDataLines = require('fs')
  .readFileSync('/dev/stdin', 'utf-8')
  .trim()
  .split('\n');

// This function calculates the Minimum Spanning Tree (MST) for a given graph.
// It uses a variant of Prim's algorithm.
// The input `networkMap` is an adjacency list where keys are node identifiers
// and values are arrays of connection objects { identifier: number, weight: number }.
// The output is an array of connection objects representing the edges in the MST.
const computeMinimumSpanningTree = (networkMap) => {
  // `includedVertices` stores the set of nodes already part of the MST.
  // We start by including node 0.
  const includedVertices = [0];
  // `spanningEdges` will accumulate the edges that form the MST.
  const spanningEdges = [];
  // `numVertices` stores the total count of nodes in the graph.
  const numVertices = Object.keys(networkMap).length;

  // The loop continues until all nodes are included in the MST.
  while (includedVertices.length !== numVertices) {
    // `candidateConnections` gathers all possible edges extending from the `includedVertices`
    // to any node not yet in `includedVertices`.
    const candidateConnections = includedVertices
      // For each node currently in the MST, get all its outgoing connections.
      .map((currentNode) => networkMap[currentNode])
      // Flatten the array of arrays of connections into a single array.
      .reduce((combinedEdges, currentBatch) => [...combinedEdges, ...currentBatch])
      // Filter out connections that lead to nodes already in the MST.
      .filter((potentialEdge) =>
        includedVertices.every((existingVertex) => existingVertex !== potentialEdge.identifier)
      );

    // `leastCostConnection` finds the edge with the smallest weight
    // among all `candidateConnections`.
    const leastCostConnection = candidateConnections.reduce((accumulator, currentEdge) =>
      accumulator.weight > currentEdge.weight ? currentEdge : accumulator
    );

    // Add the identifier of the node connected by the `leastCostConnection`
    // to the set of `includedVertices`.
    includedVertices.push(leastCostConnection.identifier);
    // Add the `leastCostConnection` itself to the `spanningEdges` list.
    spanningEdges.push(leastCostConnection);
  }

  // Return the array of edges that constitute the Minimum Spanning Tree.
  return spanningEdges;
};


// Process the raw input data lines to construct the graph's adjacency list.
const connectionMatrix = rawDataLines
  .slice(1) // Skip the first line, as it often contains metadata like node count.
  .map((currentLine) => {
    // For each subsequent line, parse its connection weights.
    return currentLine
      .trim() // Remove any leading or trailing whitespace from the line.
      .split(' ') // Split the line by spaces to get an array of stringified weights.
      .map((stringValue, nodeIndex) => {
        // Convert each string weight to a number and create a connection object.
        return { identifier: nodeIndex, weight: Number(stringValue) };
      })
      .filter((connection) => connection.weight !== -1); // Exclude connections with a weight of -1 (invalid).
  })
  .reduce((adjacencyListAccumulator, connectionsForNode, nodeIdentifier) => {
    // Populate the `adjacencyListAccumulator` object.
    // Each key `nodeIdentifier` will map to an array of its valid connections.
    adjacencyListAccumulator[nodeIdentifier] = connectionsForNode;
    return adjacencyListAccumulator;
  }, {}); // Initialize the accumulator as an empty object.


// Calculate the sum of weights of all edges in the computed Minimum Spanning Tree
// and print this total sum to the console.
console.log(
  computeMinimumSpanningTree(connectionMatrix).reduce((totalWeightSum, edgeSegment) =>
    totalWeightSum + edgeSegment.weight, 0
  )
);