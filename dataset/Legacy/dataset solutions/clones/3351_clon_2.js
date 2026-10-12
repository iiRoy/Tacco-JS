// This function calculates the number of ways to color a tree with two colors (e.g., black and white)
// such that no two adjacent nodes are both white. This is a classic tree dynamic programming problem.
function ProcessGraph(rawData) {
  // Parse the raw input string into an array of individual lines.
  let parsedLines = rawData.split("\n");

  // Extract the total number of nodes in the tree from the first line of input.
  const nodeCount = parseInt(parsedLines[0]);

  // Initialize an adjacency list to represent the tree structure.
  // Each element `adjacencyList[i]` will be an array containing the indices of nodes
  // directly connected to node `i`.
  const adjacencyList = new Array(nodeCount);

  // Initialize a dynamic programming table. `dynamicProgrammingTable[i]` will store
  // an array `[ways_if_node_i_is_white, ways_if_node_i_is_black]`.
  const dynamicProgrammingTable = new Array(nodeCount);

  // Define the modulo value to prevent integer overflow during calculations.
  // This is 10^9 + 7, a common prime modulus in competitive programming.
  const moduloValue = 1e9 + 7;

  // Iterate through the input lines to construct the tree's adjacency list.
  // The input provides N-1 edges, connecting N nodes.
  for (let edgeIdx = 0; edgeIdx < nodeCount - 0x1; edgeIdx++) {
    // Parse the current line, which contains two node numbers representing an edge.
    const tempEdgeData = parsedLines[edgeIdx + 0x1].split(" ").map(nodeString => parseInt(nodeString));

    // Ensure that the adjacency list entries for these nodes are initialized as arrays
    // before attempting to push new neighbors. Using `void 0` is a concise way to check for `undefined`.
    if (adjacencyList[tempEdgeData[0] - 0x1] === void 0) {
      adjacencyList[tempEdgeData[0] - 0x1] = [];
    }
    if (adjacencyList[tempEdgeData[1] - 0x1] === void 0) {
      adjacencyList[tempEdgeData[1] - 0x1] = [];
    }

    // Add bidirectional connections to the adjacency list, as it's an undirected tree.
    // Node indices are 0-based, so we subtract 1 from the input values.
    adjacencyList[tempEdgeData[0] - 0x1].push(tempEdgeData[1] - 0x1);
    adjacencyList[tempEdgeData[1] - 0x1].push(tempEdgeData[0] - 0x1);
  }

  // Initialize a `visitedNodes` array to keep track of node states during the traversal.
  // A value of `0x0` means unvisited, `0x1` means visited/processed.
  const visitedNodes = new Array(nodeCount).fill(0x0);

  let finalResult; // Variable to store the ultimate answer.

  // Handle the base case: if there's only one node in the tree.
  if (nodeCount !== 0x1) {
    // Mark the starting node (node 0) as visited to begin the DFS-like traversal.
    visitedNodes[0x0] = 0x1;

    // Pre-process leaf nodes (nodes with only one connection).
    // For a leaf node, it can be colored white (1 way) or black (1 way).
    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
      if (adjacencyList[nodeIdx].length === 0x1) {
        dynamicProgrammingTable[nodeIdx] = [0x1, 0x1]; // [ways_if_white, ways_if_black]
        visitedNodes[nodeIdx] = 0x1; // Mark leaf nodes as processed for their initial DP values.
      } else {
        dynamicProgrammingTable[nodeIdx] = [0x0, 0x0]; // Initialize non-leaf nodes with zero ways.
      }
    }

    // Reset the DP values for the actual root (node 0) as it might not be a leaf,
    // and its values will be computed during the main traversal.
    dynamicProgrammingTable[0x0] = [0x0, 0x0];

    // Use a stack to perform an iterative post-order traversal (similar to DFS).
    // Start the traversal from the root node (node 0).
    const processingStack = [0x0];

    // Continue processing nodes until the stack is empty.
    while (processingStack.length !== 0x0) {
      let hasUnvisitedChildren = 0x0; // Flag to detect if the current node has children yet to be processed.
      let whiteCount = 0x1; // Accumulator for ways if the current node is colored white.
      let blackCount = 0x1; // Accumulator for ways if the current node is colored black.

      // Get the index of the current node, which is at the top of the stack.
      const currentStackIndex = processingStack.length - 0x1;
      const currentNode = processingStack[currentStackIndex];

      // Iterate through all neighbors of the current node.
      for (let neighborIdx = 0; neighborIdx < adjacencyList[currentNode].length; neighborIdx++) {
        const neighborNode = adjacencyList[currentNode][neighborIdx];

        // If a neighbor has not been visited yet, it means it's a child subtree
        // that needs to be processed first. Push it onto the stack.
        if (visitedNodes[neighborNode] === 0x0) {
          visitedNodes[neighborNode] = 0x1; // Mark the child as visited.
          processingStack.push(neighborNode);
          hasUnvisitedChildren = 0x1; // Set flag indicating further traversal down this branch.
        } else {
          // If the neighbor has already been visited, its DP values are ready.
          // This neighbor is either a parent or an already processed child.
          // We use its DP values to update the current node's DP.

          // `sumOfColors`: If the current node is white, its child can be white or black.
          // We take the sum of ways for the child's subtree, ensuring at least 1 way.
          const sumOfColors = Math.max(0x1, (dynamicProgrammingTable[neighborNode][0x0] + dynamicProgrammingTable[neighborNode][0x1]) % moduloValue);

          // `blackOnlyCount`: If the current node is black, its child can only be black.
          // We take the ways for the child's subtree if the child is black, ensuring at least 1 way.
          const blackOnlyCount = Math.max(0x1, dynamicProgrammingTable[neighborNode][0x0]);

          // Multiply the current node's white ways by the sum of colors from the child.
          whiteCount = (whiteCount * sumOfColors) % moduloValue;
          // Multiply the current node's black ways by the black-only count from the child.
          blackCount = (blackCount * blackOnlyCount) % moduloValue;
        }
      }

      // If `hasUnvisitedChildren` is still `0x0`, it means all children of the current node
      // have been processed, and their DP values are incorporated.
      // We can now finalize the DP values for the current node and pop it from the stack.
      if (hasUnvisitedChildren === 0x0) {
        dynamicProgrammingTable[currentNode] = [whiteCount, blackCount];
        processingStack.pop();
      }
    }

    // The final answer is the sum of ways for the root node (node 0) to be white or black.
    finalResult = (dynamicProgrammingTable[0x0][0x0] + dynamicProgrammingTable[0x0][0x1]) % moduloValue;
  } else {
    // If there is only one node, it can be colored white or black, so there are 2 ways.
    finalResult = 0b10; // Using binary literal for 2.
  }

  // Output the computed final result to the console.
  console.log('%s', finalResult);
  return finalResult;
}

// This auxiliary function is provided for debugging and testing purposes,
// typically in a browser-based environment with specific HTML elements.
function testSolution(testCaseNum) {
  // Retrieve the input string for the specified test case from a DOM element.
  const testInput = document.getElementById("input" + testCaseNum).value;
  // Execute the main graph processing function with the test input.
  const actualAnswer = ProcessGraph(testInput);
  let testOutcome = "WA"; // Initialize the test outcome as "Wrong Answer".

  // Compare the computed answer with the expected output from another DOM element.
  if (actualAnswer == document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    testOutcome = "AC"; // If they match, set the outcome to "Accepted".
  }

  // Display the test outcome in a designated DOM element.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// This block executes the `ProcessGraph` function when the script is run in a Node.js environment.
// It reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string.
ProcessGraph(require("fs").readFileSync("/dev/stdin", "utf8"));
