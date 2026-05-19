function ProcessGraphData(inputLines) {
  // Split the input string into an array of lines
  let parsedLines = inputLines.split("\n");

  // Parse the first line to get graph dimensions
  const graphDimensions = parsedLines[0].split(" ").map((val) => +val);
  let numNodes = graphDimensions[0]; // Number of vertices in the graph
  const numEdges = graphDimensions[1]; // Number of edges in the graph

  // Initialize an adjacency matrix for the graph
  // All entries are initially zero, indicating no direct connection
  const adjMatrix = Array(numNodes)
    .fill(0)
    .map(() => Array(numNodes).fill(0));

  // Populate the adjacency matrix based on the provided edges
  // Edges are 1-indexed in input, convert to 0-indexed
  for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
    const edgeNodes = parsedLines[edgeIndex + 1].split(" ").map((val) => +val - 1);
    const nodeA = edgeNodes[0];
    const nodeB = edgeNodes[1];
    // Mark connection for undirected graph
    adjMatrix[nodeA][nodeB] = 1;
    adjMatrix[nodeB][nodeA] = 1;
  }

  // Find the node with the minimum degree
  let minDegreeVal = 9e9; // Initialize with a very large number
  let minDegreeNode = -1; // Store the index of the node with minimum degree

  for (let nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
    // Calculate the degree of the current node (sum of its row in adjMatrix)
    const currentNodeDegree = adjMatrix[nodeIdx].reduce((sum, val) => sum + val, 0);
    if (minDegreeVal > currentNodeDegree) {
      minDegreeVal = currentNodeDegree;
      minDegreeNode = nodeIdx;
    }
  }

  // Separate other nodes into two groups: neighbors of minDegreeNode and non-neighbors
  const neighborsOfMin = [];
  const nonNeighborsOfMin = [];

  for (let otherNodeIdx = 0; otherNodeIdx < numNodes; otherNodeIdx++) {
    if (otherNodeIdx === minDegreeNode) {
      continue; // Skip the minDegreeNode itself
    }
    if (adjMatrix[minDegreeNode][otherNodeIdx]) {
      neighborsOfMin.push(otherNodeIdx); // It's a neighbor
    } else {
      nonNeighborsOfMin.push(otherNodeIdx); // It's not a neighbor
    }
  }

  // Check if the neighbors of minDegreeNode form a clique
  // If any two neighbors are not connected, it's not a valid graph structure
  for (let outerIdx = 0; outerIdx < neighborsOfMin.length; outerIdx++) {
    for (let innerIdx = outerIdx + 1; innerIdx < neighborsOfMin.length; innerIdx++) {
      const node1 = neighborsOfMin[outerIdx];
      const node2 = neighborsOfMin[innerIdx];
      if (!adjMatrix[node1][node2]) {
        console.log(-1); // Output -1 and exit if not a clique
        return;
      }
    }
  }

  // Check if the non-neighbors of minDegreeNode form a clique
  // Similar check for the second group of nodes
  for (let outerIdx = 0; outerIdx < nonNeighborsOfMin.length; outerIdx++) {
    for (let innerIdx = outerIdx + 1; innerIdx < nonNeighborsOfMin.length; innerIdx++) {
      const node1 = nonNeighborsOfMin[outerIdx];
      const node2 = nonNeighborsOfMin[innerIdx];
      if (!adjMatrix[node1][node2]) {
        console.log(-1); // Output -1 and exit if not a clique
        return;
      }
    }
  }

  // If both groups form cliques, calculate and print the result
  // The formula represents the sum of edges within two cliques
  // (k * (k+1) / 2) for the first clique (neighbors + minDegreeNode)
  // ((n-k-1) * (n-k-2) / 2) for the second clique (non-neighbors)
  const result = (minDegreeVal * (minDegreeVal + 1)) / 2 + ((numNodes - minDegreeVal - 1) * (numNodes - minDegreeVal - 2)) / 2;
  console.log(result);
}

// Read input from standard input and pass it to the main processing function
ProcessGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
