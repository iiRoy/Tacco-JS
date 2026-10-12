function logMessage(content) {
  console.log(content); // Displays provided text to the console
}

function ProcessInput(rawData) {
  // Clean up the raw input string
  let processedData = rawData.trim();

  // Split the input into lines
  processedData = processedData.split("\n");

  // Parse the number of nodes and edges from the first line
  const firstLineParts = processedData[0].split(" ");
  let nodeCount = parseInt(firstLineParts[0], 10);
  let edgeCount = parseInt(firstLineParts[1], 10);

  // Remove the first line as it's already processed
  processedData.shift();

  // Initialize an adjacency map for the graph
  const adjacencyMap = {};
  for (let nodeIdx = 1; nodeIdx <= nodeCount; nodeIdx++) {
    adjacencyMap[nodeIdx] = []; // Each node starts with an empty list of neighbors
  }

  // Populate the adjacency map with edges
  for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    const currentEdgeParts = processedData[edgeIdx].split(" ");
    let firstNode = currentEdgeParts[0];
    let secondNode = currentEdgeParts[1];

    // Add bidirectional connections
    adjacencyMap[firstNode].push(secondNode);
    adjacencyMap[secondNode].push(firstNode);
  }

  // Check if all nodes have an even degree
  for (let checkIdx = 1; checkIdx <= nodeCount; checkIdx++) {
    if (adjacencyMap[checkIdx].length % 2 !== 0) {
      console.log("-1"); // Output -1 if any node has an odd degree
      return; // Exit the function early
    }
  }

  // This loop appears to be intentionally empty in the original logic
  for (let emptyLoopIdx = 1; emptyLoopIdx <= edgeCount; emptyLoopIdx++) {
    // No operations performed here
  }
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
