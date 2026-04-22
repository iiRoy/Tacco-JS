// This file implements a Disjoint Set Union (DSU) data structure,
// also known as a Union-Find algorithm, to manage connected components.
// It processes commands from standard input to perform union operations
// and connectivity queries.

/**
 * @class DisjointSetUnion
 * @description Manages a collection of disjoint sets, allowing efficient
 *              union of sets and finding the representative (root) of a set.
 *              Includes path compression and union by size optimizations.
 */
class DisjointSetUnion {
    /**
     * @private {number[]} parentArray - Stores the parent of each element.
     *                             If parentArray[i] === i, then i is the root of its set.
     */
    parentArray;

    /**
     * @private {number[]} setSizes - Stores the size of each set, indexed by its root.
     *                            Used for the union-by-size optimization.
     */
    setSizes;

    /**
     * Creates an instance of DisjointSetUnion, initializing 'initialCapacity'
     * elements, each in its own distinct set.
     * @param {number} initialCapacity - The total number of elements to manage.
     *                                   Elements are 0-indexed from 0 to initialCapacity - 1.
     */
    constructor(initialCapacity) {
        // Validate the input capacity.
        if (typeof initialCapacity !== 'number' || initialCapacity < 0 || !Number.isInteger(initialCapacity)) {
            throw new Error("Initial capacity must be a non-negative integer.");
        }

        // Initialize the internal arrays based on the provided capacity.
        this.parentArray = new Array(initialCapacity);
        this.setSizes = new Array(initialCapacity);

        // Populate the arrays: Each element is initially its own parent,
        // and each set initially has a size of 1.
        for (let elementIndex = 0; elementIndex < initialCapacity; ++elementIndex) {
            this.parentArray[elementIndex] = elementIndex;
            this.setSizes[elementIndex] = 1;
        }
    }

    /**
     * Finds the representative (root) of the set containing the given element,
     * applying path compression for efficiency.
     * @param {(string|number)} elementId - The identifier of the element to find.
     * @returns {number} The root representative of the element's set.
     */
    findRepresentative(elementId) {
        // Ensure the input element ID is treated as an integer.
        const actualNodeId = parseInt(elementId, 10);

        // Guard clause for invalid element IDs.
        if (isNaN(actualNodeId) || actualNodeId < 0 || actualNodeId >= this.parentArray.length) {
            // In a competitive programming context, this might just crash or produce undefined behavior.
            // For a robust implementation, consider throwing an error or returning a sentinel.
            throw new Error(`Invalid element ID: ${elementId}. Must be within [0, ${this.parentArray.length - 1}].`);
        }

        // If the element is its own parent, it is the root of its set.
        if (this.parentArray[actualNodeId] === actualNodeId) {
            return actualNodeId;
        }

        // Otherwise, recursively find the root and apply path compression:
        // Make the current element's parent directly point to the root.
        this.parentArray[actualNodeId] = this.findRepresentative(this.parentArray[actualNodeId]);
        return this.parentArray[actualNodeId];
    }

    /**
     * Checks if two elements belong to the same connected component (set).
     * @param {(string|number)} elementA - The identifier of the first element.
     * @param {(string|number)} elementB - The identifier of the second element.
     * @returns {boolean} True if both elements are in the same set, false otherwise.
     */
    areElementsConnected(elementA, elementB) {
        // Elements are connected if their root representatives are the same.
        return this.findRepresentative(elementA) === this.findRepresentative(elementB);
    }

    /**
     * Merges the sets containing two given elements into a single set.
     * Uses the union-by-size optimization to maintain a balanced tree structure.
     * @param {(string|number)} firstElement - The identifier of an element in the first set.
     * @param {(string|number)} secondElement - The identifier of an element in the second set.
     */
    uniteComponents(firstElement, secondElement) {
        // Find the root representatives for both elements.
        let rootOfA = this.findRepresentative(firstElement);
        let rootOfB = this.findRepresentative(secondElement);

        // If the elements are already in the same set, no action is needed.
        if (rootOfA === rootOfB) {
            return;
        }

        // Union by size optimization: Attach the root of the smaller tree
        // to the root of the larger tree. This keeps the overall tree flatter.
        if (this.setSizes[rootOfA] < this.setSizes[rootOfB]) {
            // Swap roots to ensure 'rootOfA' always refers to the larger (or equal) set.
            [rootOfA, rootOfB] = [rootOfB, rootOfA];
        }

        // Attach the smaller tree (rooted at rootOfB) under the larger tree (rooted at rootOfA).
        this.parentArray[rootOfB] = rootOfA;
        // Update the size of the combined set.
        this.setSizes[rootOfA] += this.setSizes[rootOfB];
        // The size of the merged set is now reflected in the size of rootOfA's set.
    }
}

// --- Main Program Execution ---

// Reference to the Node.js 'fs' module for file system operations.
const nodeFileSystem = require('fs');
// Define the standard input file path.
const standardInputPath = '/dev/stdin';

// Read the entire content of the standard input file,
// interpret it as UTF-8, and remove any leading/trailing whitespace.
const rawFileContent = nodeFileSystem.readFileSync(standardInputPath, 'utf8').trim();
// Split the content into an array of individual lines.
const parsedInputLines = rawFileContent.split('\n');

// Define constants for command types to improve code readability and maintainability.
const COMMAND_TYPE_UNION = '0';
const COMMAND_TYPE_QUERY = '1';

// Process the first line of input, which contains global parameters:
// N (total number of nodes) and Q (total number of operations/queries).
const initialParameters = parsedInputLines.shift().trim().split(' ');
const totalNodesCount = parseInt(initialParameters[0], 10);
const numberOfQueries = parseInt(initialParameters[1], 10);

// Instantiate the Disjoint Set Union data structure with the determined node count.
const graphConnectivityManager = new DisjointSetUnion(totalNodesCount);

// Iterate through the remaining lines, each representing a command/query.
// The loop runs for 'numberOfQueries' times, as specified in the input header.
for (let queryIndex = 0; queryIndex < numberOfQueries; ++queryIndex) {
    // Retrieve the next line from the processed input.
    const currentCommandLine = parsedInputLines.shift();

    // Skip processing if the line is empty or undefined (e.g., due to malformed input).
    if (!currentCommandLine || currentCommandLine.trim().length === 0) {
        continue;
    }

    // Parse the command line into individual tokens.
    const commandTokens = currentCommandLine.trim().split(' ');
    const operationType = commandTokens[0]; // The first token is the command type.

    // Basic validation: Ensure the command has enough arguments.
    // Union and Query commands both require 3 tokens (type, arg1, arg2).
    if (commandTokens.length < 3) {
        // Log a warning for malformed commands, but continue processing other commands.
        // console.warn(`Skipping malformed command on line ${queryIndex + 2}: "${currentCommandLine}"`);
        continue;
    }

    // Extract the numerical arguments for the command.
    const nodeParam1 = parseInt(commandTokens[1], 10);
    const nodeParam2 = parseInt(commandTokens[2], 10);

    // Execute the appropriate DSU operation based on the command type.
    if (operationType === COMMAND_TYPE_UNION) {
        // Command '0': Perform a union operation between two nodes.
        graphConnectivityManager.uniteComponents(nodeParam1, nodeParam2);
    } else if (operationType === COMMAND_TYPE_QUERY) {
        // Command '1': Check if two nodes are connected.
        const areNodesConnected = graphConnectivityManager.areElementsConnected(nodeParam1, nodeParam2);
        // Output "YES" if connected, "NO" otherwise, for improved clarity over 1/0.
        console.log(areNodesConnected ? 'YES' : 'NO');
    } else {
        // Handle unexpected command types.
        // console.warn(`Unknown command type "${operationType}" on line ${queryIndex + 2}. Skipping.`);
    }
}