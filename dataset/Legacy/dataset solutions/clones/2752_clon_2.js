function displayMessage(messageContent) {
  console.log(messageContent);
} /* This function is a utility for outputting text to the console. */

function processInputData(rawData) {
  // Initial processing of the raw input string.
  let processedData = rawData.trim();

  // The following lines are commented out as they represent alternative input parsing strategies.
  // processedData = processedData.split(" ");
  processedData = processedData.split("\n");
  // processedData = processedData.split(" ").map((val) => Number(val));
  // processedData = processedData.split("\n").map((val) => Number(val));

  // Parse the number of nodes (N) and edges (M) from the first line of input.
  const nodeCount = parseInt(processedData[0].split(" ")[0]);
  const edgeCount = parseInt(processedData[0].split(" ")[1]);

  // Check if the total number of edges is odd. If so, it's an invalid graph for certain problems.
  if (edgeCount % 2 === 1) {
    console.log("-1"); // Output error code.
    return; // Terminate execution.
  }

  // Remove the first line (containing N and M) from the processed data.
  processedData.shift();

  // Initialize an adjacency map (or list) to store graph connections.
  let adjacencyMap = {};
  for (let counter = 1; counter <= nodeCount; counter++) {
    adjacencyMap[counter] = []; // Each node starts with an empty list of neighbors.
  }

  // Populate the adjacency map with edges from the input.
  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const firstNode = processedData[edgeIndex].split(" ")[0];
    const secondNode = processedData[edgeIndex].split(" ")[1];

    // Add bidirectional connections for an undirected graph.
    adjacencyMap[firstNode].push(secondNode);
    adjacencyMap[secondNode].push(firstNode);
  }

  // Check if each node has an even degree (number of connections).
  for (let nodeIndex = 1; nodeIndex <= nodeCount; nodeIndex++) {
    if (adjacencyMap[nodeIndex].length % 2 === 1) {
      console.log("-1"); // Output error code if any node has an odd degree.
      return; // Terminate execution.
    }
  }

  // This loop is present in the original code but contains no executable logic.
  // It is preserved as an empty loop to maintain structural equivalence.
  for (let loopVar = 1; loopVar <= edgeCount; loopVar++) {
    // No operations performed here in the original logic.
  }
}

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
