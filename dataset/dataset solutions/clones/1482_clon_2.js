let computeScalarProduct = (firstVector, secondVector) => {
  // This function calculates the scalar product (dot product) of two numeric arrays.
  let totalSum = 0;
  for (let currentIdx = 0; currentIdx < firstVector.length; currentIdx++) {
    totalSum = totalSum + firstVector[currentIdx] * secondVector[currentIdx];
  }
  return totalSum;
};

function modifyAndCombineArrays(primaryList, secondaryList) {
  /*
   * This procedure modifies elements of two input arrays based on their current values.
   * The first array's elements are updated with the sum of corresponding elements.
   * The second array's elements are then updated with the sum of its original value
   * and the *new* value from the first array.
   */
  for (let loopIndex = 0; loopIndex < primaryList.length; loopIndex++) {
    primaryList[loopIndex] = primaryList[loopIndex] + secondaryList[loopIndex];
    secondaryList[loopIndex] = secondaryList[loopIndex] + primaryList[loopIndex];
  }
}

const executeGraphProcessing = (programData) => {
  // Parse the raw program input into a structured format.
  programData = programData.split(/\n/).map(rowText => rowText.split(' ').map(valStr => +valStr));

  // Extract graph dimensions.
  const numberOfVertices = programData[0][0];
  const numberOfLinks = programData[0][1];

  // Initialize the adjacency matrix for the graph.
  let connectionMatrix = [];
  for (let rIdx = 0; rIdx < numberOfVertices; rIdx++) {
    connectionMatrix.push([]);
    for (let cIdx = 0; cIdx < numberOfVertices; cIdx++) {
      connectionMatrix[rIdx].push(0);
    }
  }

  // Set diagonal elements to 1, indicating self-loops or initial connectivity.
  for (let rIdx = 0; rIdx < numberOfVertices; rIdx++) {
    connectionMatrix[rIdx][rIdx] = 1;
  }

  let nodeA, nodeB;
  // Process each link (edge) provided in the input data.
  for (let linkNum = 1; linkNum <= numberOfLinks; linkNum++) {
    nodeA = programData[linkNum][0];
    nodeB = programData[linkNum][1];
    // Mark connections in both directions (undirected graph).
    connectionMatrix[nodeA - 1][nodeB - 1] = 1;
    connectionMatrix[nodeB - 1][nodeA - 1] = 1;
  }

  // Propagate connectivity information across the graph using the defined operations.
  for (let rowOneIndex = 0; rowOneIndex < numberOfVertices; rowOneIndex++) {
    for (let rowTwoIndex = 0; rowTwoIndex < numberOfVertices; rowTwoIndex++) {
      // If two rows (representing nodes) have any common connections (non-zero scalar product),
      // then combine their connection information.
      if (computeScalarProduct(connectionMatrix[rowOneIndex], connectionMatrix[rowTwoIndex]) !== 0) {
        modifyAndCombineArrays(connectionMatrix[rowOneIndex], connectionMatrix[rowTwoIndex]);
      }
    }
  }

  let componentClusters = [];
  let visitedStatus = [...Array(numberOfVertices).keys()]; // Initially, all nodes are unvisited.

  // Identify connected components within the graph.
  for (let currentNodeIdx = 0; currentNodeIdx < numberOfVertices; currentNodeIdx++) {
    if (visitedStatus[currentNodeIdx] !== null) {
      visitedStatus[currentNodeIdx] = null; // Mark current node as visited.
      componentClusters.push([currentNodeIdx]); // Start a new cluster with this node.

      for (let neighborNodeIdx = 0; neighborNodeIdx < numberOfVertices; neighborNodeIdx++) {
        // If the current node is connected to another node (and it's not itself)
        // and that neighbor hasn't been added to a cluster yet.
        if (currentNodeIdx !== neighborNodeIdx && connectionMatrix[currentNodeIdx][neighborNodeIdx] !== 0) {
          componentClusters[componentClusters.length - 1].push(neighborNodeIdx);
          visitedStatus[neighborNodeIdx] = null; // Mark neighbor as visited.
        }
      }
    }
  }

  let finalOutcome = componentClusters.length - 1;
  console.log(finalOutcome);
};

executeGraphProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));