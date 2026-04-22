"use strict"; // Ensures code runs in strict mode, catching common coding errors

// This immediately invoked function expression (IIFE) encapsulates the entire program logic.
// It receives raw string data read from standard input.
((rawTextualData) => {
  // --- Data Initialization and Parsing Phase ---

  // Clean and parse the raw input string into an array of numbers.
  // - trim(): Removes leading/trailing whitespace.
  // - split(/\s+/): Splits the string by one or more whitespace characters.
  // - filter(Boolean): Removes any empty strings that might result from multiple spaces.
  // - map(Number): Converts each string element to a numeric type.
  const numericInputElements = rawTextualData
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(Number);

  // Validate the minimum required input elements.
  if (numericInputElements.length < 2) {
    console.error("Critical Error: Insufficient numerical input provided. Expected at least N and K.");
    return; // Terminate execution if essential data is missing.
  }

  // Extract the primary problem parameters.
  // shift() removes the first element and returns it, modifying the array.
  const totalVertexCount = numericInputElements.shift(); // Corresponds to original 'N'
  const calculationFactor = numericInputElements.shift(); // Corresponds to original 'K'
  const MODULO_LIMIT = 1000000007; // Corresponds to original 'P', defined as a constant.

  // Helper class to represent a node (vertex) in our graph structure.
  // Encapsulates properties related to graph traversal and calculation.
  class GenericNode {
    constructor() {
      this.connectedNodes = []; // Stores references to adjacent nodes (initially neighbors, then children).
      this.treeDepth = 0; // Stores the depth from the root in the constructed tree.
    }
  }

  // Create an array of GenericNode objects, indexed from 0 to totalVertexCount.
  // Array.from is used for a cleaner initialization of objects.
  const graphStructure = Array.from(
    { length: totalVertexCount + 1 },
    () => new GenericNode()
  ); // Corresponds to original 'nodes'

  // Establish the initial connection between node 0 and node 1 as per problem specification.
  // This assumes node 0 is the implicit root for subsequent tree construction.
  if (totalVertexCount >= 1) {
    graphStructure[0].connectedNodes.push(graphStructure[1]);
    graphStructure[1].connectedNodes.push(graphStructure[0]);
  } else {
    console.warn("Warning: totalVertexCount is less than 1, initial 0-1 connection logic skipped.");
  }

  // Process the remaining numeric input to build the graph's adjacency list.
  // Each pair of numbers represents an edge (u, v).
  for (let i = 0; i < numericInputElements.length; i += 2) {
    const nodeIndexA = numericInputElements[i]; // Corresponds to original 'u'
    const nodeIndexB = numericInputElements[i + 1]; // Corresponds to original 'v'

    // Basic validation for node indices to prevent out-of-bounds access.
    if (
      nodeIndexA < 0 || nodeIndexA > totalVertexCount ||
      nodeIndexB < 0 || nodeIndexB > totalVertexCount
    ) {
      console.warn(`Invalid node indices detected: (${nodeIndexA}, ${nodeIndexB}). Skipping this edge.`);
      continue; // Skip to the next pair if indices are invalid.
    }

    // Add bidirectional connections (undirected graph).
    graphStructure[nodeIndexA].connectedNodes.push(graphStructure[nodeIndexB]);
    graphStructure[nodeIndexB].connectedNodes.push(graphStructure[nodeIndexA]);
  }

  // --- Phase 1: Breadth-First Search (BFS) to build a rooted tree and determine depths ---
  // This traversal identifies parent-child relationships and removes parent pointers from children's adjacency lists.
  // It effectively transforms the graph into a tree rooted at node 0.
  const bfsTraversalQueue = [graphStructure[0]]; // Queue for BFS, starting from node 0.
  const visitedSet = new Set(); // Tracks visited nodes to prevent cycles and redundant processing.
  visitedSet.add(graphStructure[0]);
  graphStructure[0].treeDepth = 0; // The root node is at depth 0.

  let queueHeadIndex = 0; // Manual index for queue management (more performant than shift/pop for large arrays).
  while (queueHeadIndex < bfsTraversalQueue.length) {
    const currentNodeForProcessing = bfsTraversalQueue[queueHeadIndex++]; // Dequeue the current node.

    const trueChildrenOfCurrentNode = []; // Will store only the actual children (descendants).

    // Iterate through all initially connected nodes.
    for (const potentialChildCandidate of currentNodeForProcessing.connectedNodes) {
      // If a connected node has not been visited, it's a true child in the BFS tree.
      if (!visitedSet.has(potentialChildCandidate)) {
        potentialChildCandidate.treeDepth = currentNodeForProcessing.treeDepth + 1; // Set child's depth.
        visitedSet.add(potentialChildCandidate); // Mark as visited.
        bfsTraversalQueue.push(potentialChildCandidate); // Enqueue for further processing.
        trueChildrenOfCurrentNode.push(potentialChildCandidate); // Add to the list of true children.
      }
    }
    // Update the current node's 'connectedNodes' to only include its true children.
    // This effectively prunes the parent pointer, finalizing the tree structure.
    currentNodeForProcessing.connectedNodes = trueChildrenOfCurrentNode;
  }

  // --- Phase 2: Final Calculation Traversal ---
  // Perform another BFS traversal to calculate the final product based on tree depths and child counts.
  const finalCalculationQueue = [graphStructure[0]]; // Re-initialize queue for the calculation phase.
  let accumulatedProduct = 1; // Stores the running product, initialized to 1.

  // Helper function for modular multiplication to keep numbers within bounds.
  const performModularMultiplication = (val1, val2) =>
    (val1 * val2) % MODULO_LIMIT;

  let calcQueueHeadIndex = 0; // Another manual index for queue management.
  while (calcQueueHeadIndex < finalCalculationQueue.length) {
    const currentCalculationNode = finalCalculationQueue[calcQueueHeadIndex++]; // Dequeue a node.

    let baseFactorForNode; // This factor depends on the node's depth.

    // Determine the base factor based on the node's depth level.
    if (currentCalculationNode.treeDepth <= 1) { // Original: t.height < 2 (which is 0 or 1)
      baseFactorForNode = calculationFactor - currentCalculationNode.treeDepth;
    } else {
      baseFactorForNode = calculationFactor - 2; // For nodes at depth 2 or greater.
    }

    // Multiply the accumulated product by terms derived from the base factor and child index.
    // This loop processes each child of the current node.
    for (
      let childOrdinalIndex = 0;
      childOrdinalIndex < currentCalculationNode.connectedNodes.length;
      ++childOrdinalIndex
    ) {
      const termValue = baseFactorForNode - childOrdinalIndex;

      // Ensure the term is non-negative before applying modulo, as JS '%' can yield negative results.
      // This ensures the modulo result is always in the [0, MODULO_LIMIT-1] range.
      const positiveTermModulo = (termValue % MODULO_LIMIT + MODULO_LIMIT) % MODULO_LIMIT;
      accumulatedProduct = performModularMultiplication(
        accumulatedProduct,
        positiveTermModulo
      );
    }

    // Enqueue all children of the current node for subsequent processing in the calculation.
    for (const childNodeToQueue of currentCalculationNode.connectedNodes) {
      finalCalculationQueue.push(childNodeToQueue);
    }
  }

  // Output the final computed result.
  console.log(accumulatedProduct);

})(
  // Read the entire content of standard input synchronously, using UTF-8 encoding.
  require("fs").readFileSync("/dev/stdin", "utf8")
);