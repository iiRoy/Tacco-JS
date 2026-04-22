function CalculateTreePaths(sourceData) {
  // Separate the provided input data into individual lines
  const dataLines = sourceData.split("\n");
  // Determine the total number of nodes (vertices) from the first line
  const vertexCount = parseInt(dataLines[0], 10);
  // Initialize an array to store adjacency lists for each vertex
  const neighborMap = Array(vertexCount);
  // Prepare an array for dynamic programming values (path counts for subtrees)
  const dynamicValues = Array(vertexCount);
  // Define the modulo base for calculations to prevent integer overflow
  const remainderBase = 1000000007;

  // Iterate through the input lines to build the graph's adjacency list
  for (let idx = 0; idx < vertexCount - 1; idx++) {
    // Parse each line representing an edge between two nodes
    const currentPair = dataLines[idx + 1].split(" ").map(str => parseInt(str, 10));
    const nodeA = currentPair[0] - 1; // Convert to 0-indexed
    const nodeB = currentPair[1] - 1; // Convert to 0-indexed

    // Ensure the adjacency lists for these nodes are initialized if they are undefined
    if (neighborMap[nodeA] == null) {
      neighborMap[nodeA] = [];
    }
    if (neighborMap[nodeB] == null) {
      neighborMap[nodeB] = [];
    }

    // Add the connection in both directions (undirected graph)
    neighborMap[nodeA].push(nodeB);
    neighborMap[nodeB].push(nodeA);
  }

  // Initialize a status array to keep track of visited nodes during traversal
  const processingFlags = Array(vertexCount).fill(0); // 0: unvisited, 1: visited/processing

  // Handle graph processing for trees with more than one node
  if (vertexCount !== 1) {
    // Mark the starting node (root, typically 0) as initially visited
    processingFlags[0] = 1;

    // Pre-process leaf nodes (nodes with a single connection, excluding the root)
    for (let idx = 0; idx < vertexCount; idx++) {
      // A node is a leaf if its adjacency list has one entry and it's not the root
      if (neighborMap[idx].length === 1 && idx !== 0) {
        dynamicValues[idx] = [1, 1]; // Base case: one path for 'white', one for 'black'
        processingFlags[idx] = 1;    // Mark leaf as processed
      } else {
        dynamicValues[idx] = [0, 0]; // Default values for non-leaf nodes
      }
    }
    // Explicitly set initial DP values for the root node
    dynamicValues[0] = [0, 0];

    // Initialize a stack for depth-first traversal, starting from the root
    const traversalStack = [0];

    // Continue processing nodes until the stack is empty
    while (traversalStack.length > 0) {
      let pendingVisit = 0;   // Flag to indicate if a child needs to be visited
      let firstOption = 1;    // Accumulator for the 'first coloring option' (e.g., node is white)
      let secondOption = 1;   // Accumulator for the 'second coloring option' (e.g., node is black)

      const currentStackPos = traversalStack.length - 1; // Index of the current node on top of stack
      const currentNode = traversalStack[currentStackPos];

      // Iterate through all neighbors of the current node
      for (let idx = 0; idx < neighborMap[currentNode].length; idx++) {
        const neighborNode = neighborMap[currentNode][idx];

        // If a neighbor has not been processed yet, push it onto the stack
        if (processingFlags[neighborNode] === 0) {
          processingFlags[neighborNode] = 1; // Mark as visited for this traversal pass
          traversalStack.push(neighborNode);
          pendingVisit = 1; // Indicate that a new node was added to the stack
        } else {
          // If the neighbor has already been processed (i.e., it's a child or parent)
          // Retrieve its pre-calculated dynamic programming values
          const childWhitePaths = dynamicValues[neighborNode][0];
          const childBlackPaths = dynamicValues[neighborNode][1];

          // Calculate factor for the 'first coloring option' of the current node
          const calcResultOne = Math.max(1, (childWhitePaths + childBlackPaths) % remainderBase);
          // Calculate factor for the 'second coloring option' of the current node
          const calcResultTwo = Math.max(1, childWhitePaths);

          // Update the accumulators for the current node's path counts
          firstOption = (firstOption * calcResultOne) % remainderBase;
          secondOption = (secondOption * calcResultTwo) % remainderBase;
        }
      }

      // If no new children were pushed, all children of this node have been processed
      if (pendingVisit === 0) {
        dynamicValues[currentNode] = [firstOption, secondOption]; // Store the calculated DP values
        traversalStack.pop(); // Remove the current node from the stack
      }
    }
    // The final answer is the sum of the two coloring options for the root node
    var computedAnswer = (dynamicValues[0][0] + dynamicValues[0][1]) % remainderBase;
  } else {
    // For a single-node tree (N=1), there are two ways to color it (e.g., white or black)
    var computedAnswer = 2;
  }

  // Print the final result to standard output
  console.log('%s', computedAnswer);
  // Return the calculated value
  return computedAnswer;
}

// Auxiliary function for local testing and debugging purposes
function verifyFunction(testCaseId) {
  // Retrieve the input string from a designated HTML input element
  const testInput = document.getElementById("input" + testCaseId).value;
  // Execute the main tree path calculation with the retrieved input
  const actualAnswer = CalculateTreePaths(testInput);
  // Initialize the test outcome status as "Wrong Answer"
  let verificationStatus = "WA";
  // Compare the computed answer with the expected output from another HTML element
  if (actualAnswer == document.getElementById("output" + testCaseId).value.split("\n")[0]) {
    verificationStatus = "AC"; // If they match, mark as "Accepted"
  }
  // Display the verification status in the respective HTML result element
  document.getElementById("result" + testCaseId).innerHTML = verificationStatus;
}

// Entry point for execution in standard competitive programming environments
CalculateTreePaths(require("fs").readFileSync("/dev/stdin", "utf8"));