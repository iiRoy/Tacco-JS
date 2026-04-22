// Extensive Type III clone of a Disjoint Set Union (DSU) data structure implementation.
// This version includes significant structural modifications, renaming, and additional logic.

// A class representing a Disjoint Set Union (DSU) data structure, also known as Union-Find.
// It manages a collection of disjoint sets, supporting operations to merge sets and find the representative of a set.
class ConnectivityManager {
  // Initializes the DSU structure for a given number of elements.
  // Each element initially belongs to its own set.
  // @param {number} totalElements - The total count of elements to manage.
  constructor(totalElements) {
    // Input validation: Ensure the number of elements is positive.
    if (totalElements <= 0) {
      throw new Error("Cannot initialize ConnectivityManager with zero or negative elements.");
    }

    // `parentNodes[i]` stores the parent of element `i`. If `parentNodes[i] === i`, then `i` is a root.
    // Using Array.from for initialization as a structural variation.
    this.parentNodes = Array.from({
      length: totalElements
    }, (_, index) => index);

    // `rankValues[i]` stores the rank (or approximate height) of the tree rooted at `i`.
    // Used for union by rank optimization to keep trees flat.
    this.rankValues = new Array(totalElements).fill(0);

    // `componentSizes[i]` stores the size of the set (number of elements) if `i` is the root of that set.
    // Used for union by size optimization.
    this.componentSizes = new Array(totalElements).fill(1);

    // Keep track of the total number of distinct components (sets). This is a Type III addition.
    this.numDisjointSets = totalElements;
  }

  // Helper method to ensure an index is within valid bounds. This is a Type III addition.
  // @param {number} elementIndex - The index to validate.
  // @returns {boolean} True if the index is valid, false otherwise.
  #isValidIndex(elementIndex) {
    return elementIndex >= 0 && elementIndex < this.parentNodes.length;
  }

  // Finds the representative (root) of the set containing the given element.
  // Implements iterative path compression for efficiency, a structural change from recursive.
  // @param {number} elementIdx - The index of the element.
  // @returns {number} The root of the set containing elementIdx.
  // @throws {Error} If the element index is out of bounds.
  findRepresentative(elementIdx) {
    // Guard clause for invalid input index.
    if (!this.#isValidIndex(elementIdx)) {
      throw new Error(`Element index ${elementIdx} is out of bounds.`);
    }

    let currentNode = elementIdx;
    // Traverse upwards until the root is found.
    // The root is an element whose parent is itself.
    while (this.parentNodes[currentNode] !== currentNode) {
      currentNode = this.parentNodes[currentNode];
    }
    const setRoot = currentNode; // This is the actual root.

    // Path compression: Make all nodes on the path from elementIdx to setRoot point directly to setRoot.
    // This is the iterative approach, a Type III modification.
    currentNode = elementIdx;
    while (this.parentNodes[currentNode] !== setRoot) {
      const nextNode = this.parentNodes[currentNode];
      this.parentNodes[currentNode] = setRoot; // Point current node to the root.
      currentNode = nextNode; // Move to the next node in the original path.
    }

    return setRoot;
  }

  // Merges the sets containing two given elements.
  // It first finds the roots of the elements' respective sets and then combines those roots.
  // This method replaces the original 'unite' and 'link' methods with a unified, rewritten logic.
  // @param {number} firstElement - The index of the first element.
  // @param {number} secondElement - The index of the second element.
  // @returns {boolean} True if a merge operation actually occurred, false otherwise (e.g., if elements were already in the same set).
  combineSets(firstElement, secondElement) {
    // Find the representatives (roots) of the sets for both elements.
    // This will also perform path compression.
    const rootOfFirst = this.findRepresentative(firstElement);
    const rootOfSecond = this.findRepresentative(secondElement);

    // If the elements are already in the same set, no action is needed.
    if (rootOfFirst === rootOfSecond) {
      return false; // No merge happened.
    }

    // Implement union by rank strategy: Attach the smaller rank tree under the root of the larger rank tree.
    // If ranks are equal, arbitrarily attach one to the other and increment the rank of the new root.
    let targetRoot = rootOfFirst;
    let sourceRoot = rootOfSecond;

    // Ensure targetRoot always has rank >= sourceRoot's rank for consistent merging strategy.
    // This swap logic is a structural change.
    if (this.rankValues[targetRoot] < this.rankValues[sourceRoot]) {
      [targetRoot, sourceRoot] = [sourceRoot, targetRoot]; // Destructuring assignment for swap.
    }

    // Attach the source set's root to the target set's root.
    this.parentNodes[sourceRoot] = targetRoot;
    // Update the size of the combined set.
    this.componentSizes[targetRoot] += this.componentSizes[sourceRoot];

    // If ranks were initially equal, increment the rank of the new target root.
    // This makes the tree slightly taller.
    if (this.rankValues[rootOfFirst] === this.rankValues[rootOfSecond]) {
      this.rankValues[targetRoot]++;
    }

    // A merge successfully occurred, so decrement the count of distinct sets.
    this.numDisjointSets--; // Type III addition: Maintain component count directly.
    return true; // Merge completed.
  }

  // Returns the current number of disjoint sets (components).
  // This is a Type III addition to expose the internal `numDisjointSets` count.
  // @returns {number} The count of distinct sets.
  getComponentCount() {
    return this.numDisjointSets;
  }
}

// Main execution function to process input and determine connectivity.
const executeSolution = (rawInputText) => {
  // Input sanity check. This is a Type III addition (guard clause).
  if (!rawInputText || typeof rawInputText !== 'string' || rawInputText.trim().length === 0) {
    console.error("Error: Received empty or invalid input text.");
    return -1; // Indicate an error or specific failure.
  }

  // Split input into lines, filtering out any empty lines that might result from extra newlines.
  // Using a regex for split is a minor Type II variation. Filter is Type III.
  const allInputLines = rawInputText.trim().split(/\r?\n/).filter(line => line.length > 0);

  // Extract the first line which contains the number of elements (N) and queries (M).
  // Using shift() is a Type III modification.
  const configLine = allInputLines.shift();
  if (!configLine) { // Type III guard.
    console.error("Error: Input is missing configuration line.");
    return -1;
  }

  // Parse N and M. Using parseInt with radix 10 is a Type II change.
  const [numElementsStr, numQueriesStr] = configLine.split(' ');
  const totalNodes = parseInt(numElementsStr, 10);
  const totalOperations = parseInt(numQueriesStr, 10);

  // Validate parsed numerical inputs. Type III addition.
  if (isNaN(totalNodes) || totalNodes <= 0 || isNaN(totalOperations) || totalOperations < 0) {
    console.error(`Error: Invalid configuration parameters (Nodes: ${totalNodes}, Operations: ${totalOperations}).`);
    return -1;
  }

  // Instantiate our Disjoint Set Union manager. Renamed.
  const connectivityStructure = new ConnectivityManager(totalNodes);

  // Process each query line.
  // Using forEach loop as a structural change (Type III) from a traditional for loop.
  allInputLines.forEach((operationLine, queryIndex) => {
    // Basic validation for query line format. Type III addition.
    if (!operationLine || operationLine.trim().length === 0) {
      console.warn(`Warning: Skipping empty query line at index ${queryIndex}.`);
      return; // Skip this line and continue.
    }

    const [valA_str, valB_str] = operationLine.split(' ');
    const nodeA_idx = parseInt(valA_str, 10);
    const nodeB_idx = parseInt(valB_str, 10);

    // Validate parsed query values. Type III addition.
    if (isNaN(nodeA_idx) || isNaN(nodeB_idx) || nodeA_idx < 1 || nodeB_idx < 1 || nodeA_idx > totalNodes || nodeB_idx > totalNodes) {
      console.warn(`Warning: Skipping invalid query [${nodeA_idx}, ${nodeB_idx}] at line ${queryIndex + 2}.`);
      return;
    }

    // Elements are 1-indexed in the input, convert to 0-indexed for array access.
    connectivityStructure.combineSets(nodeA_idx - 1, nodeB_idx - 1);
  });

  // The final answer is the number of distinct components remaining.
  // Using the new getComponentCount() method (Type III).
  const finalComponentCount = connectivityStructure.getComponentCount();

  // Output the result.
  console.log(finalComponentCount);
  return finalComponentCount; // Return for testing purposes; console.log is the primary output.
};

// Entry point for execution, handling environment-specific input/output.
// This block ensures the solution can be tested locally or run in a judge environment.
// The conditional logic is rewritten to use if/else for structural variation (Type III).
if (process.env.TEST_MODE_ENABLED) {
  // If a specific test mode is enabled (e.g., 'unit' or 'integration'),
  // we might call a separate test runner.
  // For simplicity here, we'll assume 'unit' means running a hardcoded test case.
  if (process.env.TEST_MODE_ENABLED === 'unit') {
    // Example of a minimal unit test stub. This is a new code fragment (Type III addition).
    try {
      const testInput = "5 3\n1 2\n3 4\n2 5";
      const expectedOutput = 2; // (1,2,5), (3,4)
      const actualOutput = executeSolution(testInput);
      if (actualOutput === expectedOutput) {
        console.log("Unit test passed!");
      } else {
        console.error(`Unit test failed: Expected ${expectedOutput}, got ${actualOutput}`);
      }
    } catch (e) {
      console.error("Unit test encountered an error:", e);
    }
  } else {
    // Default test behavior if TEST_MODE_ENABLED is set but not 'unit'.
    console.log("Running in generic test mode, no specific test case defined.");
    // Could call executeSolution with a default test input or prompt for one.
  }
} else {
  // Production or standard execution path: Read from /dev/stdin.
  // Using a more explicit variable for the file system module (Type III modification).
  const fileSystemModule = require('fs');
  const inputDataBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  executeSolution(inputDataBuffer);
}

// Additional comment to signify extensive changes throughout the file.
// This concludes the modified source code.