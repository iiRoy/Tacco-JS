function multiplyVectors (firstVec, secondVec) {
  // Initialize a variable to store the scalar product
  let dotProduct = 0;

  // Iterate through the elements of the input vectors
  for (let idx = 0; idx < firstVec.length; idx++) {
    // Accumulate the product of corresponding elements
    dotProduct = dotProduct + firstVec[idx] * secondVec[idx];
  }

  // Return the computed dot product
  return dotProduct;
}

function addVectors (firstVec, secondVec) {
  // Loop through each element of the vectors
  for (let idx = 0; idx < firstVec.length; idx++) {
    // Update the first vector's element by adding the second vector's element
    firstVec[idx] = firstVec[idx] + secondVec[idx];
    // Update the second vector's element by adding the (now updated) first vector's element
    secondVec[idx] = secondVec[idx] + firstVec[idx];
  }
}


function ProcessGraphData (rawData) {
    // Parse the input string into a 2D array of numbers
    rawData = rawData.split(/\n/).map(line => line.split(' ').map(val => +val));

    // Extract the number of nodes (N) and edges (M) from the first line
    const numNodes = rawData[0][0];
    const numEdges = rawData[0][1];

    // Initialize an adjacency matrix for the graph
    let adjacencyMatrix = [];
    for (let rowIdx = 0; rowIdx < numNodes; rowIdx++) {
      adjacencyMatrix.push([]); // Add a new row
      for (let colIdx = 0; colIdx < numNodes; colIdx++) {
        adjacencyMatrix[rowIdx].push(0); // Initialize all entries to 0
      }
    }

    // Set diagonal elements to 1, indicating self-loops or initial connectivity
    for (let rowIdx = 0; rowIdx < numNodes; rowIdx++) {
      adjacencyMatrix[rowIdx][rowIdx] = 1;
    }

    // Process each edge from the input
    let nodeA, nodeB;
    for (let edgeIdx = 1; edgeIdx <= numEdges; edgeIdx++) {
      nodeA = rawData[edgeIdx][0];
      nodeB = rawData[edgeIdx][1];
      // Mark connectivity in both directions (undirected graph)
      adjacencyMatrix[nodeA - 1][nodeB - 1] = 1;
      adjacencyMatrix[nodeB - 1][nodeA - 1] = 1;
    }

    // Propagate connectivity based on shared neighbors
    // This effectively finds connected components
    for (let outerIdx = 0; outerIdx < numNodes; outerIdx++) {
      for (let anotherRowIdx = 0; anotherRowIdx < numNodes; anotherRowIdx++) {
        // If two nodes share any common neighbor (dot product of their rows is non-zero)
        if (multiplyVectors(adjacencyMatrix[outerIdx], adjacencyMatrix[anotherRowIdx]) !== 0) {
          // Merge their connectivity information
          addVectors(adjacencyMatrix[outerIdx], adjacencyMatrix[anotherRowIdx]);
        }
      }
    }

    // Identify distinct connected components
    let connectedComponents = [];
    // Create an array to keep track of visited nodes
    let unvisitedNodes = [...Array(numNodes).keys()]; // [0, 1, ..., numNodes-1]

    for (let rowIdx = 0; rowIdx < numNodes; rowIdx++) {
      // If the current node has not been assigned to a component yet
      if (unvisitedNodes[rowIdx] !== null) {
        unvisitedNodes[rowIdx] = null; // Mark as visited
        connectedComponents.push([rowIdx]); // Start a new component with this node

        // Iterate through all other nodes to find connected ones
        for (let colIdx = 0; colIdx < numNodes; colIdx++) {
          // If it's a different node and there's a connection
          if (rowIdx !== colIdx && adjacencyMatrix[rowIdx][colIdx] !== 0) {
            // Add the connected node to the current component
            connectedComponents[connectedComponents.length - 1].push(colIdx);
            unvisitedNodes[colIdx] = null; // Mark the connected node as visited
          }
        }
      }
    }

    // The result is the number of connected components minus one
    // (assuming the problem asks for the number of "bridges" or "cuts" needed to disconnect,
    // or simply the number of components if it's 0-indexed or similar interpretation)
    let finalCount = connectedComponents.length - 1;
    console.log(finalCount);
}


ProcessGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
