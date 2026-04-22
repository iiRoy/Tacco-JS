function ProcessInput(rawData) {
  // The raw input string is split into an array of lines.
  let processedLines = rawData.split("\n");

  // The first line contains two space-separated integers.
  // Extract the first integer to determine the number of entities.
  const firstLineItems = processedLines[0].split(" ");
  let numEntities = parseInt(firstLineItems[0], 10);
  // The second integer (maxConnections) is parsed but not directly utilized in this specific logic path.
  let maxConnections = parseInt(firstLineItems[1], 10);

  // An array is initialized to serve as an adjacency list for the graph structure.
  // Its size is numEntities + 1 to accommodate 1-based indexing for nodes.
  let adjacencyGraph = new Array(numEntities + 1);

  // A Set is used to keep track of all distinct nodes that appear as sources in the input.
  let uniqueSourceNodes = new Set();

  // The first line, having been parsed, is removed from the array of lines.
  processedLines.shift();

  // The remaining lines are mapped to arrays of two integers, representing edges.
  let edgeData = processedLines.map(lineContent =>
    lineContent.split(" ").map(valStr => parseInt(valStr, 10))
  );

  // Two trailing placeholder entries are removed from the edge data array.
  edgeData.pop();
  edgeData.pop();

  // Iterate over each pair of numbers (an edge) to build the graph.
  edgeData.map(function (currentEdge) {
    const sourceIdentifier = currentEdge[0];
    const targetIdentifier = currentEdge[1];

    // If the source node's entry in the adjacency list is undefined, initialize it as an empty array.
    if (adjacencyGraph[sourceIdentifier] === undefined) {
      adjacencyGraph[sourceIdentifier] = [];
    }
    // Add the target node to the source node's list of neighbors.
    adjacencyGraph[sourceIdentifier].push(targetIdentifier);
    // Record the source node as a unique node encountered.
    uniqueSourceNodes.add(sourceIdentifier);
  });

  // Convert the set of unique source nodes into an array for easier iteration.
  const distinctSourceNodeArray = [...uniqueSourceNodes];

  // A memoization table is created to store the computed longest path for each node.
  // It's initialized with -1 to indicate that paths have not yet been calculated.
  let memoizationTable = new Array(numEntities + 1).fill(-1);

  // This variable will store the maximum path length found across all starting nodes.
  let overallLongestPath = 0;

  // Loop through each distinct source node to calculate its longest path.
  for (let nodeIndex = 0; nodeIndex < distinctSourceNodeArray.length; nodeIndex++) {
    const currentNodeForCalc = distinctSourceNodeArray[nodeIndex];
    memoizationTable[currentNodeForCalc] = computeNodePath(currentNodeForCalc);
    overallLongestPath = Math.max(memoizationTable[currentNodeForCalc], overallLongestPath);
  }

  // Recursive function to determine the longest path starting from a specified node.
  function computeNodePath(nodeIdentifier) {
    // If the path for this node has already been calculated and stored, return it.
    if (memoizationTable[nodeIdentifier] !== -1) {
      return memoizationTable[nodeIdentifier];
    } else {
      // If the node has no outgoing edges, its longest path is 0.
      if (adjacencyGraph[nodeIdentifier] === undefined) {
        memoizationTable[nodeIdentifier] = 0;
        return 0;
      }

      // Initialize the maximum path length from the current node.
      let currentMaxPath = 0;
      // Iterate over each neighbor of the current node.
      for (let neighborIndex = 0; neighborIndex < adjacencyGraph[nodeIdentifier].length; neighborIndex++) {
        let pathSegmentLength = 0;

        // Recursively call this function for the neighbor and add 1 (for the edge to the neighbor).
        pathSegmentLength = computeNodePath(adjacencyGraph[nodeIdentifier][neighborIndex]) + 1;

        // Update the current maximum path if a longer one is found.
        currentMaxPath = Math.max(currentMaxPath, pathSegmentLength);
      }
      // Store the computed maximum path for the current node before returning.
      memoizationTable[nodeIdentifier] = currentMaxPath;
      return currentMaxPath;
    }
  }

  // Log the final overall longest path to the console.
  console.log('The determined maximum path is: %d', overallLongestPath);
  return overallLongestPath;
}

// This helper function is designed for simulating test cases in a browser environment.
function testExecutionHelper(caseNumber) {
  // Retrieve the input string for the specific test case from a DOM element.
  let testInputString = document.getElementById("input" + caseNumber).value;
  // Execute the main processing function with the test input.
  let calculatedOutcome = ProcessInput(testInputString);
  let validationStatus = "WA"; // Default status: Wrong Answer.

  // Compare the calculated outcome with the expected output from another DOM element.
  if (calculatedOutcome == document.getElementById("output" + caseNumber).value.split("\n")[0]) {
    validationStatus = "AC"; // Status: Accepted.
  }
  // Display the validation status in a designated result element.
  document.getElementById("result" + caseNumber).innerHTML = validationStatus;
}

// Entry point for execution in environments like Node.js, reading from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));