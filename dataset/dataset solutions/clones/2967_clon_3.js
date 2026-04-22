const parseNumericValue = (rawString) => {
  const parsedVal = parseInt(rawString, 10);
  // Type III: Add a basic validation for numeric parsing
  if (isNaN(parsedVal)) {
    // In a real application, this might throw an error or log a warning.
    // For competitive programming, returning 0 or a default is common.
    return 0;
  }
  return parsedVal;
};

const processGraphData = (inputPayloadString) => {
  // Type III: Break down input processing into more granular steps.
  const allInputLines = inputPayloadString.split('\n');

  // Extract the first line containing graph dimensions.
  const graphConfigLine = allInputLines.shift();
  if (!graphConfigLine) {
    // Type III: Guard against empty input
    console.log(0);
    return;
  }

  const dimensionTokens = graphConfigLine.split(' ');
  const nodeQuantity = parseNumericValue(dimensionTokens[0]);
  const edgeQuantity = parseNumericValue(dimensionTokens[1]);

  // Type III: Add an early exit for degenerate cases or invalid parameters.
  if (nodeQuantity <= 0) {
    console.log(0); // If no nodes, no components.
    return;
  }
  if (edgeQuantity < 0) {
    // console.warn("Warning: Negative edge quantity provided, treating as zero.");
    // For this problem context, it won't affect the outcome for nodeQuantity > 0.
  }

  // Initialize data structures:
  // - `visitedNodeFlags`: A boolean array to track which nodes have been reached.
  // - `connectionMatrix`: An adjacency list representation of the directed graph.
  //   Indices are 1-based to match problem description.
  const visitedNodeFlags = new Array(nodeQuantity + 1).fill(false);
  const connectionMatrix = Array.from({ length: nodeQuantity + 1 }, () => []);

  // Type III: Use a traditional `for` loop instead of `map` for edge parsing for structural change.
  // Populate the connection matrix from the remaining input lines.
  for (let lineIndex = 0; lineIndex < allInputLines.length; lineIndex++) {
    const currentLine = allInputLines[lineIndex].trim();
    if (currentLine.length === 0) {
      continue; // Type III: Skip any potentially empty lines.
    }

    const edgeComponents = currentLine.split(' ');
    const originNode = parseNumericValue(edgeComponents[0]);
    const destinationNode = parseNumericValue(edgeComponents[1]);

    // Type III: Add bounds checking for nodes to prevent out-of-bounds access.
    if (originNode >= 1 && originNode <= nodeQuantity &&
        destinationNode >= 1 && destinationNode <= nodeQuantity) {
      connectionMatrix[originNode].push(destinationNode);
    } else {
      // console.warn(`Ignored invalid edge definition: (${originNode}, ${destinationNode})`);
    }
  }

  // `explorePathSegment` is a recursive function to traverse and mark nodes within a component.
  // It's designed to follow a single path from a node by consuming its first available edge.
  const explorePathSegment = (currentIdentifier) => {
    // Mark the current node as visited.
    visitedNodeFlags[currentIdentifier] = true;

    // Type III: Rewrite the condition for path termination.
    // If the current node has no more outgoing connections, this path segment ends.
    if (connectionMatrix[currentIdentifier].length === 0) {
      return; // No further traversal from this node along this path.
    }

    // Type III: Explicitly extract and consume the next node in the path.
    // The original algorithm's `shift()` behavior is preserved here,
    // meaning an edge is 'used' and removed upon traversal.
    const nextPotentialNode = connectionMatrix[currentIdentifier].shift();

    // Type III: Add an explicit check for the existence of the next node
    // and an optimization: only recurse if the next node hasn't been visited yet
    // by *this component's* exploration. The original would recurse even if visited,
    // leading to redundant calls; this is an efficiency improvement.
    if (nextPotentialNode !== undefined && !visitedNodeFlags[nextPotentialNode]) {
      explorePathSegment(nextPotentialNode);
    }
    // The function implicitly returns after the recursive call, ensuring
    // a single-path-tracing behavior before control returns to the caller.
  };

  let componentAccumulator = 0; // Stores the final count of connected components.
  let currentScanNode = 1;      // Iterator to systematically check each node from 1 to nodeQuantity.

  // Iterate through all nodes to discover and count distinct components.
  while (currentScanNode <= nodeQuantity) {
    // If a node hasn't been visited yet, it implies it's part of a new, unexplored component.
    if (!visitedNodeFlags[currentScanNode]) {
      componentAccumulator++; // Increment the component count.
      // Initiate traversal from this unvisited node to mark all reachable nodes within its component.
      explorePathSegment(currentScanNode);
    }
    // Move to the next node to continue the search for new components.
    currentScanNode++;
  }

  // Type III: Output the final result.
  // A wrapper function like `displayFinalCount(componentAccumulator)` could be used for more Type III.
  console.log(componentAccumulator);
};

// The 'use strict' directive has been removed as a Type III modification,
// as it's often implicit in modern JavaScript module contexts or can be omitted.
processGraphData(require('fs').readFileSync('/dev/stdin', 'utf8'));