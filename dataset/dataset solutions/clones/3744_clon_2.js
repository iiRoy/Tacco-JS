// This function processes graph data from a string input
function ProcessInput(inputStringData) {
  // Split the entire input string into individual lines
  // Each line represents either graph dimensions or an edge
  const inputLines = inputStringData.split("\n");

  // Parse the first line to get the total number of nodes and edges
  // The first line contains two space-separated integers: N M
  const graphDimensions = inputLines[0].split(" ").map(entry => parseInt(entry, 10));

  // Extract the total number of edges from the parsed dimensions
  const totalEdgeCount = graphDimensions[1];
  // Extract the total number of nodes from the parsed dimensions
  const totalNodeCount = graphDimensions[0];

  // Initialize an adjacency matrix for the graph
  // All entries are initially zero, indicating no connections
  const adjacencyMatrix = Array(totalNodeCount).fill(0).map(
    () => Array(totalNodeCount).fill(0)
  );

  // Populate the adjacency matrix based on the provided edge data
  // Iterate through each edge definition line
  for (let edgeIteration = 0; edgeIteration < totalEdgeCount; edgeIteration++) {
    // Parse the current edge line: two space-separated node indices (u v)
    // Subtract 1 from each index to convert to 0-based indexing
    const currentEdgeNodes = inputLines[edgeIteration + 1].split(" ").map(
      nodeString => Number(nodeString) - 1
    );

    // Mark the connection in the adjacency matrix for both directions (undirected graph)
    const nodeA = currentEdgeNodes[0];
    const nodeB = currentEdgeNodes[1];
    adjacencyMatrix[nodeA][nodeB] = 1;
    adjacencyMatrix[nodeB][nodeA] = 1;
  }

  // Initialize variables to find the node with the minimum degree
  // 'minimumDegreeValue' stores the smallest degree found so far
  let minimumDegreeValue = 999999999; // A very large number to start with
  // 'nodeWithMinimumDegree' stores the index of the node that has the minimum degree
  let nodeWithMinimumDegree;

  // Iterate through all nodes to calculate their degrees
  for (let nodeIdx = 0; nodeIdx < totalNodeCount; nodeIdx++) {
    // Calculate the degree of the current node by summing its row in the adjacency matrix
    const currentDegree = adjacencyMatrix[nodeIdx].reduce(
      (sumOfConnections, isConnected) => sumOfConnections + isConnected,
      0
    );

    // If the current node's degree is less than the minimum found so far, update
    if (minimumDegreeValue > currentDegree) {
      minimumDegreeValue = currentDegree;
      nodeWithMinimumDegree = nodeIdx;
    }
  }

  // Initialize two arrays to partition the remaining nodes based on their connection to the minimum degree node
  const partitionGroupOne = []; // Nodes directly connected to 'nodeWithMinimumDegree'
  const partitionGroupTwo = []; // Nodes NOT directly connected to 'nodeWithMinimumDegree'

  // Iterate through all nodes to perform the partitioning
  for (let scanningNodeIdx = 0; scanningNodeIdx < totalNodeCount; scanningNodeIdx++) {
    // Skip the node that has the minimum degree itself
    if (scanningNodeIdx === nodeWithMinimumDegree) continue;

    // Check if the current scanning node is adjacent to the minimum degree node
    if (adjacencyMatrix[nodeWithMinimumDegree][scanningNodeIdx]) {
      // If connected, add it to the first partition group
      partitionGroupOne.push(scanningNodeIdx);
    } else {
      // If not connected, add it to the second partition group
      partitionGroupTwo.push(scanningNodeIdx);
    }
  }

  // Verify that all nodes within the first partition group (connected to the min degree node) form a clique
  // This means every node in 'partitionGroupOne' must be connected to every other node in 'partitionGroupOne'
  for (let idxA = 0; idxA < partitionGroupOne.length; idxA++) {
    for (let idxB = idxA + 1; idxB < partitionGroupOne.length; idxB++) {
      // Get the actual node indices from the partition group
      const nodeP = partitionGroupOne[idxA];
      const nodeQ = partitionGroupOne[idxB];

      // If there's no edge between nodeP and nodeQ, it's not a clique, so output -1 and exit
      if (!adjacencyMatrix[nodeP][nodeQ]) {
        console.log(-1);
        return;
      }
    }
  }

  // Verify that all nodes within the second partition group (not connected to the min degree node) form a clique
  // This means every node in 'partitionGroupTwo' must be connected to every other node in 'partitionGroupTwo'
  for (let idxC = 0; idxC < partitionGroupTwo.length; idxC++) {
    for (let idxD = idxC + 1; idxD < partitionGroupTwo.length; idxD++) {
      // Get the actual node indices from the partition group
      const nodeR = partitionGroupTwo[idxC];
      const nodeS = partitionGroupTwo[idxD];

      // If there's no edge between nodeR and nodeS, it's not a clique, so output -1 and exit
      if (!adjacencyMatrix[nodeR][nodeS]) {
        console.log(-1);
        return;
      }
    }
  }

  // If both partition groups form cliques internally, calculate and print the result
  // This formula seems to be specific to a graph problem, likely related to finding edges in a complete bipartite graph
  // or a similar structure based on the minimum degree node.
  const sizeOfPartitionOne = minimumDegreeValue; // The number of neighbors of the minimum degree node
  const sizeOfTotalNodes = totalNodeCount;
  const sizeOfPartitionTwo = totalNodeCount - minimumDegreeValue - 1; // Total nodes - neighbors - the min degree node itself

  // The formula calculates the sum of edges in two cliques
  const resultValue = (sizeOfPartitionOne * (sizeOfPartitionOne + 1) / 2) +
                      (sizeOfPartitionTwo * (sizeOfPartitionTwo - 1) / 2);

  console.log(resultValue);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));