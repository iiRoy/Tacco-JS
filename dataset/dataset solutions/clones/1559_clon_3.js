"use strict";

// Module for file system operations, using a modern Node.js import style.
const fileSystem = require("node:fs");

// Read all standard input content from /dev/stdin as a UTF-8 string.
const stdInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");

// Split the entire input string into an array of tokens, using spaces or newlines as delimiters.
const inputTokens = stdInputContent.split(/ |\n/);
let currentTokenIndex = 0; // Pointer to keep track of the current token being processed.

/**
 * Retrieves the next token from the global inputTokens array and parses it as an integer.
 * Advances the currentTokenIndex.
 * @returns {number} The parsed integer value of the next token.
 */
function getNextInteger() {
    // Use parseInt with radix 10 for explicit base conversion.
    return parseInt(inputTokens[currentTokenIndex++], 10);
}

/**
 * Retrieves a pair of tokens from the input stream and parses them as integers.
 * This is a specialized function for reading two numbers, often used for edges.
 * @returns {number[]} An array containing two parsed integer values.
 */
function getIntegerPair() {
    const firstValue = parseInt(inputTokens[currentTokenIndex++], 10);
    const secondValue = parseInt(inputTokens[currentTokenIndex++], 10);
    return [firstValue, secondValue];
}

/**
 * Implements a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * It efficiently manages a collection of disjoint sets, supporting operations to
 * merge sets and find the representative of a set.
 */
class DisjointSetUnion {
    // `privateData` array:
    // If `privateData[i]` is negative, `i` is a root of a set, and its value is `-(size of the set)`.
    // If `privateData[i]` is non-negative, `i` is not a root, and its value is the parent of `i`.
    privateData;

    /**
     * Initializes the DSU structure for a specified number of elements.
     * Each element from 1 to `initialElementCount` starts in its own distinct set.
     * @param {number} initialElementCount - The total number of elements to manage (typically 1-indexed).
     */
    constructor(initialElementCount) {
        // Create an array of size `initialElementCount + 1` to accommodate 1-indexed elements.
        // All elements are initially roots of their own sets, with a size of 1 (represented as -1).
        this.privateData = Array.from({ length: initialElementCount + 1 }, () => -1);
    }

    /**
     * Finds the representative (root) of the set containing `elementIndex`.
     * This method applies path compression optimization: during traversal,
     * it makes every node on the path point directly to the root.
     * @param {number} elementIndex - The element whose set representative is to be found.
     * @returns {number} The representative (root) of the set containing `elementIndex`.
     */
    findRepresentative(elementIndex) {
        // If `elementIndex` is a root (its `privateData` value is negative), return it.
        if (this.privateData[elementIndex] < 0) {
            return elementIndex;
        }
        // Otherwise, recursively find the root of its parent and apply path compression.
        this.privateData[elementIndex] = this.findRepresentative(this.privateData[elementIndex]);
        return this.privateData[elementIndex];
    }

    /**
     * Checks if two elements belong to the same disjoint set.
     * @param {number} elementA - The first element.
     * @param {number} elementB - The second element.
     * @returns {boolean} True if both elements have the same representative (are in the same set), false otherwise.
     */
    areConnected(elementA, elementB) {
        return this.findRepresentative(elementA) === this.findRepresentative(elementB);
    }

    /**
     * Merges the sets containing `elementA` and `elementB` if they are currently in different sets.
     * This method applies union by size optimization: the smaller tree is attached under the root of the larger tree.
     * @param {number} elementA - The first element whose set is to be merged.
     * @param {number} elementB - The second element whose set is to be merged.
     * @returns {boolean} True if the sets were distinct and successfully merged, false if they were already in the same set.
     */
    mergeSets(elementA, elementB) {
        // Find the representatives of the sets containing `elementA` and `elementB`.
        let rootA = this.findRepresentative(elementA);
        let rootB = this.findRepresentative(elementB);

        // If the representatives are the same, the elements are already in the same set; no merge needed.
        if (rootA === rootB) {
            return false;
        }

        // Union by size: Attach the smaller tree (less negative size) to the root of the larger tree (more negative size).
        // Since sizes are stored as negative values, `this.privateData[rootA] > this.privateData[rootB]` means
        // the set rooted at `rootA` is smaller than or equal in size to the set rooted at `rootB`.
        if (this.privateData[rootA] > this.privateData[rootB]) {
            // The set rooted at `rootA` is smaller. Attach `rootA` to `rootB`.
            this.privateData[rootB] += this.privateData[rootA]; // Update the size of the new combined set.
            this.privateData[rootA] = rootB; // Make `rootB` the parent of `rootA`.
        } else {
            // The set rooted at `rootB` is smaller or equal. Attach `rootB` to `rootA`.
            this.privateData[rootA] += this.privateData[rootB]; // Update the size of the new combined set.
            this.privateData[rootB] = rootA; // Make `rootA` the parent of `rootB`.
        }
        return true;
    }

    /**
     * Returns the size of the set containing the given element.
     * @param {number} elementIndex - The element whose set size is to be determined.
     * @returns {number} The total number of elements in the set containing `elementIndex`.
     */
    getSetSize(elementIndex) {
        // The size of the set is stored as a negative value at its root.
        return -this.privateData[this.findRepresentative(elementIndex)];
    }
}

/**
 * The main function that orchestrates the solution to the problem.
 * It reads graph parameters, constructs a DSU structure, processes edges,
 * and determines the size of the largest connected component.
 * @returns {number} The maximum size found among all connected components.
 */
function solveProblem() {
    // Read the number of nodes (N) and the number of edges (M) from the input.
    const nodeCount = getNextInteger();
    const edgeCount = getNextInteger();

    // Basic input validation to handle potentially invalid graph parameters.
    if (nodeCount < 0 || edgeCount < 0) {
        console.error("Error: Node count and edge count must be non-negative.");
        return 0; // Return 0 for invalid input, or throw an error.
    }
    if (nodeCount === 0) {
        return 0; // If there are no nodes, there are no components.
    }

    // Initialize the Disjoint Set Union structure with `nodeCount` elements.
    // This structure will manage the connected components of the graph.
    const componentManager = new DisjointSetUnion(nodeCount);

    // Iterate through each of the `edgeCount` edges provided in the input.
    for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
        // Read the two vertices (endpoints) of the current edge.
        const [vertexA, vertexB] = getIntegerPair();
        // Merge the sets containing `vertexA` and `vertexB`. This effectively
        // connects their components in the graph.
        componentManager.mergeSets(vertexA, vertexB);
    }

    // After processing all edges, we need to find the largest connected component.
    // The size of each component is stored as a negative value at its root in `componentManager.privateData`.
    let maxComponentSize = 0;

    // Iterate through all possible node indices (from 1 to nodeCount, assuming 1-indexed nodes).
    for (let i = 1; i <= nodeCount; i++) {
        const componentDataValue = componentManager.privateData[i];
        // If `componentDataValue` is negative, it means `i` is a root of a component.
        if (componentDataValue < 0) {
            // The absolute value of `componentDataValue` is the size of the component.
            // Update `maxComponentSize` if this component is larger than any found so far.
            maxComponentSize = Math.max(maxComponentSize, -componentDataValue);
        }
    }

    // If `nodeCount` was positive but no edges were present, each node forms its own component of size 1.
    // In this case, `maxComponentSize` would correctly be 1.
    // If `nodeCount` was 0, we already handled it.

    // Return the maximum component size found.
    return maxComponentSize;
}

// Execute the main solution function to get the result.
const solutionResult = solveProblem();

// Output the final result to standard output, ensuring it's converted to a string.
if (solutionResult !== undefined) {
    console.log(solutionResult.toString());
}