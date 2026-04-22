'use strict';

/**
 * Solves a graph construction problem: given N nodes and K target edges,
 * find a specific graph configuration and print its edges.
 *
 * @param {string[]} inputDataLines - Array of strings, where the first string contains N and K.
 */
function processGraphProblem(inputDataLines) {
  // Validate and parse the initial parameters (total nodes and target edges).
  if (!inputDataLines || inputDataLines.length === 0 || inputDataLines[0].trim() === '') {
    console.error("Error: Input data is empty or malformed.");
    return;
  }

  const initialParameters = inputDataLines[0].split(' ').map(Number);

  // Additional validation for parsed numbers.
  if (initialParameters.length < 2 || isNaN(initialParameters[0]) || isNaN(initialParameters[1])) {
    console.error("Error: Invalid number format for N and K. Expected two integers.");
    return;
  }

  const totalNodes = initialParameters[0]; // Represents 'N' from original
  const targetEdgeCount = initialParameters[1]; // Represents 'K' from original

  let mainChainSizeCandidate; // This variable will hold the 'M' value if a solution is found.
  let isConfigurationValid = false; // Flag to track if a suitable 'M' is found.

  // Iterate through possible 'M' values in descending order, starting from N down to 1.
  // This 'M' corresponds to `mainChainSize` in the problem's specific construction.
  for (let currentMainChainSize = totalNodes; currentMainChainSize >= 1; currentMainChainSize--) {
    // Calculate 'L' based on the original problem's definition: L = N - M + 1.
    // This 'L' represents the number of vertices forming a specific component.
    const componentSizeForClique = totalNodes - currentMainChainSize + 1;

    // Calculate the number of edges in a clique of size (L-1).
    // This part corresponds to (L - 1) * (L - 2) / 2 in the original formula.
    // If L-1 is less than 2, there are 0 edges in such a clique.
    const edgesFromCliqueComponent = (componentSizeForClique - 1) > 1
      ? ((componentSizeForClique - 1) * (componentSizeForClique - 2)) / 2
      : 0;

    // Calculate the number of edges in a path of length (M-1).
    // This part corresponds to M - 1 in the original formula.
    const edgesFromPathSegment = currentMainChainSize - 1;

    // Sum the edges from both components to get the total calculated edges for this 'M'.
    const totalCalculatedEdges = edgesFromCliqueComponent + edgesFromPathSegment;

    // Check if the calculated total edges match the target edge count K.
    if (totalCalculatedEdges === targetEdgeCount) {
      isConfigurationValid = true;
      mainChainSizeCandidate = currentMainChainSize; // Store the found 'M'
      break; // Exit the loop as a valid configuration is found.
    }
  }

  // If no valid configuration (no suitable 'M') was found, print -1 and exit.
  if (!isConfigurationValid) {
    console.log(-1);
    return;
  }

  // Use the validated 'M' (renamed `finalChainSize`) for output.
  const finalChainSize = mainChainSizeCandidate;

  // Output the determined chain length.
  console.log(`Determined chain length: ${finalChainSize}`);
  // Output the total number of edges that will be printed by the following loops.
  // Note: The graph construction described by the printing loops always results in N-1 edges.
  console.log(totalNodes - 1);

  // First set of edges: forms a path-like structure from node 1 to finalChainSize + 1.
  // This loop prints `finalChainSize` edges: (1,2), (2,3), ..., (M, M+1).
  for (let nodeIdentifier = 1; nodeIdentifier <= finalChainSize; nodeIdentifier++) {
    console.log(`${nodeIdentifier} ${nodeIdentifier + 1}`);
  }

  // Second set of edges: connects remaining nodes to a central node.
  // The central node is `finalChainSize + 1`.
  // The remaining nodes are from `finalChainSize + 2` up to `totalNodes`.
  // This loop prints `totalNodes - (finalChainSize + 1)` edges.
  const centralConnectionNode = finalChainSize + 1;
  for (let additionalNode = finalChainSize + 2; additionalNode <= totalNodes; additionalNode++) {
    console.log(`${centralConnectionNode} ${additionalNode}`);
  }
}

/**
 * Sets up standard input handling to read data and pass it to the problem solver.
 */
function executeProblemSolver() {
  let rawInputBuffer = "";
  process.stdin.resume(); // Keep the process alive for input.
  process.stdin.setEncoding("utf8"); // Specify input encoding.

  // Accumulate data chunks as they arrive.
  process.stdin.on("data", function (dataChunk) {
    rawInputBuffer += dataChunk;
  });

  // When all input has been received, process it.
  process.stdin.on("end", function () {
    // Basic validation for empty input after trimming whitespace.
    if (rawInputBuffer.trim() === "") {
      console.error("Error: No input was provided via stdin.");
      return;
    }
    const parsedInputLines = rawInputBuffer.split("\n");
    processGraphProblem(parsedInputLines);
  });
}

// Initiate the problem-solving process by setting up input handling.
executeProblemSolver();