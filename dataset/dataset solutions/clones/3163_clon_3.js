// This module performs connectivity analysis on a set of nodes
// based on a sequence of edge additions, calculating a 'disconnection metric'
// after each operation. It utilizes a Disjoint Set Union (DSU) data structure.

/**
 * Initializes a Disjoint Set Union (DSU) structure for a given number of elements.
 * Each element starts in its own set.
 * @param {number} nodeCount - The total number of elements/nodes.
 * @returns {Array<Object>} An array representing the DSU structure.
 *   Each object { ancestor: number, currentSize: number } stores the parent index
 *   and the size of the component if it's a root.
 */
function initializeDisjointSets(nodeCount) {
  // Validate input: ensure a positive number of nodes
  if (typeof nodeCount !== 'number' || nodeCount < 0) {
    throw new Error("Node count must be a non-negative number.");
  }
  
  // Create an array to hold information for each element.
  // Initially, each element is its own ancestor and forms a component of size 1.
  const setElements = Array.from({ length: nodeCount }, (_, k) => ({
    ancestor: k,       // The representative (parent) of this element's set
    currentSize: 1,    // The size of the component if this element is a root
  }));
  return setElements;
}

/**
 * Finds the representative (root) of the set containing the given element,
 * applying path compression for efficiency.
 * @param {number} elementIndex - The index of the element to find the representative for.
 * @param {Array<Object>} setElements - The DSU data structure.
 * @returns {number} The index of the representative (root) of the element's set.
 */
function getSetRepresentative(elementIndex, setElements) {
  // Guard clause for invalid index
  if (elementIndex < 0 || elementIndex >= setElements.length) {
    throw new Error(`Invalid element index: ${elementIndex}. Must be within [0, ${setElements.length - 1}]`);
  }

  const currentElement = setElements[elementIndex];

  // If the element's ancestor is itself, it's the representative of its set.
  if (currentElement.ancestor === elementIndex) {
    return elementIndex;
  }

  // Recursively find the actual representative and apply path compression
  // by directly linking the current element to the set's root.
  const actualRepresentativeIdx = getSetRepresentative(currentElement.ancestor, setElements);
  currentElement.ancestor = actualRepresentativeIdx; // Path compression
  return actualRepresentativeIdx;
}

/**
 * Checks if two elements belong to the same connected component (set).
 * @param {number} firstNodeIdx - The index of the first element.
 * @param {number} secondNodeIdx - The index of the second element.
 * @param {Array<Object>} setElements - The DSU data structure.
 * @returns {boolean} True if both elements are in the same set, false otherwise.
 */
function checkConnectivity(firstNodeIdx, secondNodeIdx, setElements) {
  const repA = getSetRepresentative(firstNodeIdx, setElements);
  const repB = getSetRepresentative(secondNodeIdx, setElements);
  return repA === repB;
}

/**
 * Merges the sets containing two given elements. Uses union-by-size heuristic.
 * If the elements are already in the same set, no action is taken.
 * @param {number} nodeAIdx - The index of the first element.
 * @param {number} nodeBIdx - The index of the second element.
 * @param {Array<Object>} setElements - The DSU data structure.
 */
function uniteComponents(nodeAIdx, nodeBIdx, setElements) {
  // Guard clauses for invalid indices
  if (nodeAIdx < 0 || nodeAIdx >= setElements.length || nodeBIdx < 0 || nodeBIdx >= setElements.length) {
    throw new Error("One or both node indices are out of bounds for union operation.");
  }

  let rootAIdx = getSetRepresentative(nodeAIdx, setElements);
  let rootBIdx = getSetRepresentative(nodeBIdx, setElements);

  // If they are already in the same set, there's nothing to merge.
  if (rootAIdx === rootBIdx) {
    return;
  }

  // Apply union by size heuristic: attach the smaller tree under the root of the larger tree.
  // This helps keep the tree flatter, improving performance.
  let rootAElement = setElements[rootAIdx];
  let rootBElement = setElements[rootBIdx];

  if (rootAElement.currentSize < rootBElement.currentSize) {
    // Swap the roles of A and B to ensure A always refers to the larger or equal-sized component.
    [rootAIdx, rootBIdx] = [rootBIdx, rootAIdx];
    [rootAElement, rootBElement] = [rootBElement, rootAElement];
  }

  // Attach rootB's component to rootA's component.
  rootBElement.ancestor = rootAIdx;
  // Update the size of the combined component (now represented by rootA).
  rootAElement.currentSize += rootBElement.currentSize;
}

/**
 * Queries the size of the connected component (set) containing a given element.
 * @param {number} elementIndex - The index of the element.
 * @param {Array<Object>} setElements - The DSU data structure.
 * @returns {number} The size of the component.
 */
function queryComponentSize(elementIndex, setElements) {
  // Guard clause for invalid index
  if (elementIndex < 0 || elementIndex >= setElements.length) {
    throw new Error(`Invalid element index: ${elementIndex}. Must be within [0, ${setElements.length - 1}]`);
  }
  const representativeIdx = getSetRepresentative(elementIndex, setElements);
  return setElements[representativeIdx].currentSize;
}

/**
 * Main function to solve the connectivity problem and calculate the disconnection metric.
 * @param {string} rawDataInput - The raw input string containing problem data.
 */
function executeConnectivitySolver(rawDataInput) {
  // Parse the input data: split by lines, then by spaces, convert to numbers.
  const parsedDataMatrix = rawDataInput.split('\n')
                                     .filter(line => line.trim() !== '') // Remove empty lines
                                     .map(line => line.trim().split(' ').map(Number));

  // Extract N (total nodes) and M (number of operations/edges)
  const totalNodes = parsedDataMatrix[0][0];
  const numOperations = parsedDataMatrix[0][1];

  // Basic input validation for N and M
  if (totalNodes <= 0 || numOperations < 0) {
    // For M=0, the loop will simply not run, and the initial score is correctly printed.
    if (totalNodes <= 0) {
      console.error("Error: Number of nodes (N) must be a positive integer.");
      return;
    }
    // No specific error for M < 0 since the problem usually implies M >= 0.
  }

  // Store connection operations (bridges) in reverse order of appearance.
  // This allows processing them as 'adding' bridges to count connected components.
  const reversedEdges = [];
  for (let i = numOperations - 1; i >= 0; i--) {
    reversedEdges.push(parsedDataMatrix[1 + i]);
  }

  // Initialize the DSU structure for all nodes.
  const setElements = initializeDisjointSets(totalNodes);

  // The initial disconnection metric: total possible pairs (N * (N-1) / 2)
  let currentIsolationScore = (totalNodes * (totalNodes - 1)) / 2;
  
  // Store the history of the isolation score.
  const metricHistory = [];

  // Iterate through the bridges in reverse chronological order.
  // Each iteration effectively 'adds' a bridge, reducing the isolation score.
  for (const currentEdge of reversedEdges) {
    // Extract node indices, adjusting for 0-based indexing.
    const uIdx = currentEdge[0] - 1;
    const vIdx = currentEdge[1] - 1;

    // Validate edge indices
    if (uIdx < 0 || uIdx >= totalNodes || vIdx < 0 || vIdx >= totalNodes) {
      console.error(`Warning: Edge [${currentEdge[0]}, ${currentEdge[1]}] contains out-of-bounds node indices. Skipping.`);
      // If we skip, the isolation score doesn't change, and the sets aren't united.
      metricHistory.push(currentIsolationScore);
      continue;
    }

    // Check if the two nodes are already connected.
    if (!checkConnectivity(uIdx, vIdx, setElements)) {
      // If not connected, adding this bridge will reduce the isolation.
      // The reduction is the product of the sizes of the two components being merged.
      const componentSizeU = queryComponentSize(uIdx, setElements);
      const componentSizeV = queryComponentSize(vIdx, setElements);
      const isolationReduction = componentSizeU * componentSizeV;
      currentIsolationScore -= isolationReduction;
    }
    
    // Record the score *before* uniting the components for the next iteration,
    // as this score represents the state *after* the current bridge was "added".
    metricHistory.push(currentIsolationScore);

    // Unite the components of the two nodes.
    uniteComponents(uIdx, vIdx, setElements);
  }

  // The `metricHistory` is currently in reverse chronological order (after last bridge, ..., after first bridge).
  // Reverse it to get the chronological order (after first bridge, ..., after last bridge).
  metricHistory.reverse();

  // Output the disconnection metric for each step, starting from the first bridge added.
  for (let i = 0; i < numOperations; i++) {
    console.log(metricHistory[i]);
  }
}

// Entry point: read input from stdin and run the solver.
executeConnectivitySolver(require('fs').readFileSync('/dev/stdin', 'utf8'));