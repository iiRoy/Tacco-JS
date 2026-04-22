"use strict";

/**
 * Executes the main problem-solving logic.
 * This function encapsulates the entire solution to avoid global scope pollution.
 */
function executeProblemSolver() {
  // --- Utility Functions ---

  /**
   * Parses a string or array of strings into an array of integers.
   * Handles whitespace separation for string input.
   * @param {string | string[]} inputData - The data to parse.
   * @returns {number[]} An array of parsed integers.
   */
  const parseIntegerArray = (inputData) => {
    // Ensure we're working with an array of strings.
    const stringElements = Array.isArray(inputData)
      ? inputData
      : inputData.split(/\s+/).filter(Boolean); // Filter out empty strings from split

    return stringElements.map((str) => {
      const parsed = parseInt(str, 10);
      if (isNaN(parsed)) {
        // Optionally, throw an error or handle invalid number format
        console.warn(`Warning: Could not parse "${str}" to an integer.`);
        return 0; // Default to 0 or handle as needed
      }
      return parsed;
    });
  };

  /**
   * Calculates the total number of unique pairs (combinations of 2) from a given count of items.
   * This is equivalent to n * (n - 1) / 2.
   * @param {number} n - The total number of items.
   * @returns {number} The total number of possible unique pairs.
   */
  const calculateTotalPossiblePairs = (n) => {
    if (n < 2) {
      return 0;
    }
    return n * (n - 1) / 2;
  };

  // --- BigUnsignedInt Class Definition ---
  /**
   * Represents an arbitrary-precision unsigned integer.
   * Stores numbers in chunks to handle values larger than standard JavaScript numbers.
   */
  class BigUnsignedInt {
    /**
     * The number of decimal digits each chunk of the array represents.
     * This affects the base of each chunk (chunkBase).
     */
    static chunkDigits = 7;
    /**
     * The base for each chunk, calculated as 10 raised to chunkDigits.
     * E.g., if chunkDigits is 7, chunkBase is 10,000,000.
     */
    static chunkBase = Math.pow(10, BigUnsignedInt.chunkDigits);

    /**
     * Creates an instance of BigUnsignedInt.
     * @param {number} initialValue - The initial numeric value (must be non-negative).
     */
    constructor(initialValue) {
      this.chunks = []; // Array to store number chunks

      if (initialValue < 0) {
        throw new Error("BigUnsignedInt must be initialized with a non-negative value.");
      }
      if (initialValue === 0) {
        this.chunks = [0];
        return;
      }

      let currentVal = initialValue;
      let chunkIndex = 0;
      while (currentVal > 0) {
        this.chunks[chunkIndex] = currentVal % BigUnsignedInt.chunkBase;
        currentVal = Math.floor(currentVal / BigUnsignedInt.chunkBase);
        chunkIndex++;
      }
    }

    /**
     * Performs addition with another BigUnsignedInt.
     * @param {BigUnsignedInt} otherOperand - The BigUnsignedInt to add.
     * @returns {BigUnsignedInt} A new BigUnsignedInt representing the sum.
     */
    performAddition(otherOperand) {
      const sumResult = new BigUnsignedInt(0);
      sumResult.chunks = []; // Clear initial [0] chunk for actual sum calculation

      const maxLength = Math.max(this.chunks.length, otherOperand.chunks.length);
      let carryOver = 0;

      for (let i = 0; i < maxLength; i++) {
        const chunkA = this.chunks[i] || 0;
        const chunkB = otherOperand.chunks[i] || 0;
        const currentSum = chunkA + chunkB + carryOver;

        sumResult.chunks[i] = currentSum % BigUnsignedInt.chunkBase;
        carryOver = Math.floor(currentSum / BigUnsignedInt.chunkBase);
      }

      if (carryOver > 0) {
        sumResult.chunks[maxLength] = carryOver;
      }
      return sumResult;
    }

    /**
     * Performs multiplication with another BigUnsignedInt.
     * @param {BigUnsignedInt} otherOperand - The BigUnsignedInt to multiply.
     * @returns {BigUnsignedInt} A new BigUnsignedInt representing the product.
     */
    performMultiplication(otherOperand) {
      const productResult = new BigUnsignedInt(0);
      productResult.chunks = []; // Clear initial [0] chunk

      for (let leftChunkIdx = 0; leftChunkIdx < this.chunks.length; leftChunkIdx++) {
        const chunkValA = this.chunks[leftChunkIdx];
        if (chunkValA === 0) continue; // Optimization

        for (let rightChunkIdx = 0; rightChunkIdx < otherOperand.chunks.length; rightChunkIdx++) {
          const chunkValB = otherOperand.chunks[rightChunkIdx];
          if (chunkValB === 0) continue; // Optimization

          let productOfChunks = chunkValA * chunkValB;
          let targetChunkIdx = leftChunkIdx + rightChunkIdx;

          // Propagate carries from the product
          while (productOfChunks > 0 || (productResult.chunks[targetChunkIdx] === undefined && targetChunkIdx < productResult.chunks.length + 1)) {
            const currentChunkVal = productResult.chunks[targetChunkIdx] || 0;
            const sumWithCarry = currentChunkVal + productOfChunks;

            productResult.chunks[targetChunkIdx] = sumWithCarry % BigUnsignedInt.chunkBase;
            productOfChunks = Math.floor(sumWithCarry / BigUnsignedInt.chunkBase);
            targetChunkIdx++;
          }
        }
      }

      // Ensure the result is at least [0] if it's empty (e.g., multiplying by 0)
      if (productResult.chunks.length === 0) {
        productResult.chunks = [0];
      }
      return productResult;
    }

    /**
     * Converts the BigUnsignedInt to its string representation.
     * @returns {string} The string representation of the number.
     */
    formatAsString() {
      // Create a reversed copy of chunks to process from most significant to least.
      const reversedChunks = [...this.chunks].reverse();

      // Find the index of the first non-zero chunk to avoid leading zeros.
      const firstSignificantChunkIndex = reversedChunks.findIndex(
        (chunk) => chunk !== 0
      );

      if (firstSignificantChunkIndex === -1) {
        // All chunks are zero, so the number is 0.
        return "0";
      }

      // Slice from the first significant chunk and map to string.
      return reversedChunks
        .slice(firstSignificantChunkIndex)
        .map((chunkValue, index) => {
          if (index === 0) {
            // The first chunk (most significant) doesn't need padding.
            return String(chunkValue);
          } else {
            // Subsequent chunks need to be padded with leading zeros to maintain chunkDigits length.
            return String(chunkValue).padStart(BigUnsignedInt.chunkDigits, "0");
          }
        })
        .join("");
    }
  }

  // --- DisjointSetUnion Class Definition ---
  /**
   * Implements the Disjoint Set Union (DSU) data structure, also known as Union-Find.
   * Used to track connected components in a graph.
   */
  class DisjointSetUnion {
    /** @type {number[]} */
    parentRefs; // Stores the parent of each element. `parentRefs[i] = i` if i is a root.
    /** @type {number[]} */
    setSizes; // Stores the size of the set for each root element. `setSizes[i]` is valid only if i is a root.

    /**
     * Initializes a DisjointSetUnion structure for N elements.
     * Each element is initially in its own set.
     * @param {number} totalElements - The total number of elements (0 to totalElements-1).
     */
    constructor(totalElements) {
      if (totalElements < 0) {
        throw new Error("Number of elements must be non-negative.");
      }
      this.parentRefs = Array.from({ length: totalElements }, (_, i) => i); // Each element is its own parent initially.
      this.setSizes = Array(totalElements).fill(1); // Each set initially has size 1.
    }

    /**
     * Finds the representative (root) of the set containing the given element.
     * Applies path compression to flatten the tree structure for faster future lookups.
     * @param {number} elementId - The ID of the element to find (0-indexed).
     * @returns {number} The root ID of the set containing elementId.
     */
    findRepresentative(elementId) {
      if (elementId < 0 || elementId >= this.parentRefs.length) {
        throw new Error(`Element ID ${elementId} is out of bounds.`);
      }

      // If elementId is its own parent, it's the root.
      if (this.parentRefs[elementId] === elementId) {
        return elementId;
      }

      // Recursively find the root and compress the path.
      this.parentRefs[elementId] = this.findRepresentative(this.parentRefs[elementId]);
      return this.parentRefs[elementId];
    }

    /**
     * Unites (merges) the sets containing two given elements.
     * Uses union by size heuristic to keep trees shallow.
     * @param {number} id1 - The ID of the first element.
     * @param {number} id2 - The ID of the second element.
     * @returns {boolean} True if the sets were merged, false if they were already in the same set.
     */
    uniteSets(id1, id2) {
      let root1 = this.findRepresentative(id1);
      let root2 = this.findRepresentative(id2);

      if (root1 === root2) {
        // Elements are already in the same set.
        return false;
      }

      // Union by size: attach the smaller tree under the root of the larger tree.
      if (this.setSizes[root1] < this.setSizes[root2]) {
        [root1, root2] = [root2, root1]; // Swap to ensure root1 is always the larger or equal sized tree
      }

      this.parentRefs[root2] = root1; // Make root1 the parent of root2.
      this.setSizes[root1] += this.setSizes[root2]; // Update the size of the new root's set.
      return true;
    }

    /**
     * Retrieves the size of the set containing the given element.
     * @param {number} elementId - The ID of the element.
     * @returns {number} The size of the set.
     */
    getSetSize(elementId) {
      const root = this.findRepresentative(elementId);
      return this.setSizes[root];
    }
  }

  // --- Main Execution Logic ---

  // Read input from standard input.
  const problemInput = require("fs").readFileSync("/dev/stdin", "utf8");
  const inputLines = problemInput.trim().split("\n");

  // Parse N (number of nodes) and M (number of edges).
  const [numNodes, numEdges] = parseIntegerArray(inputLines[0]);

  // Guard clause for trivial cases
  if (numNodes <= 1) {
    for (let i = 0; i < numEdges; i++) {
      console.log(0); // No pairs possible with 0 or 1 node
    }
    return;
  }

  // Parse bridge data (edges).
  const edgeList = inputLines.slice(1, numEdges + 1).map((line) => {
    const [nodeA, nodeB] = parseIntegerArray(line);
    // Adjust to 0-indexed for internal DSU use.
    return { u: nodeA - 1, v: nodeB - 1 };
  });

  // This array will store the count of *connected* pairs as edges are removed.
  // We'll calculate it by iterating bridges in reverse (adding edges).
  const cumulativeConnectedPairCounts = [];
  const connectivityStructure = new DisjointSetUnion(numNodes);
  let currentConnectedPairCount = 0; // Stores the number of connected pairs of nodes.

  // Iterate through the edges in reverse order.
  // This simulates adding bridges one by one and calculating the number of connected pairs.
  for (let i = numEdges - 1; i >= 0; i--) {
    const { u: nodeU, v: nodeV } = edgeList[i];

    // Store the current count of connected pairs before processing the next edge.
    // This value corresponds to the state *before* the i-th bridge is added (when iterating in reverse).
    cumulativeConnectedPairCounts.push(currentConnectedPairCount);

    // Find the representatives (roots) of the sets containing nodeU and nodeV.
    const rootU = connectivityStructure.findRepresentative(nodeU);
    const rootV = connectivityStructure.findRepresentative(nodeV);

    if (rootU !== rootV) {
      // If the nodes are in different sets, merging them will create new connected pairs.
      // The number of new pairs is (size of set U) * (size of set V).
      const sizeU = connectivityStructure.getSetSize(rootU);
      const sizeV = connectivityStructure.getSetSize(rootV);
      currentConnectedPairCount += sizeU * sizeV;

      // Perform the union operation to merge the sets.
      connectivityStructure.uniteSets(nodeU, nodeV);
    }
    // If rootU === rootV, the nodes are already connected, so adding this bridge
    // doesn't create any *new* pairs, and currentConnectedPairCount remains unchanged.
  }

  // The `cumulativeConnectedPairCounts` array was built in reverse order of output.
  // Reverse it to get the results in the correct sequence (from 0 bridges to M bridges).
  cumulativeConnectedPairCounts.reverse();

  // The problem asks for the number of *unconnected* pairs.
  // Total possible pairs = N * (N - 1) / 2.
  // Unconnected pairs = Total possible pairs - Connected pairs.
  const totalPossiblePairs = calculateTotalPossiblePairs(numNodes);

  // Calculate the final results: number of inconvenient pairs for each bridge removal scenario.
  const finalInconvenientPairCounts = cumulativeConnectedPairCounts.map((connectedCount) => {
    return totalPossiblePairs - connectedCount;
  });

  // Output the results.
  finalInconvenientPairCounts.forEach((count) => console.log(count));
}

// Invoke the main problem solver function.
executeProblemSolver();