// This script manages disjoint sets, processing connection and query operations.
// It reads input from standard input, typically provided by a system.

// Acquire file system module for reading input.
const fileSystemModule = require("fs");

// Read the entire content from standard input as a UTF-8 string.
let sourceData;
try {
    sourceData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
} catch (errorReadingFile) {
    console.error("Error reading from /dev/stdin:", errorReadingFile.message);
    // Exit or handle the error appropriately, e.g., use mock data
    process.exit(1);
}

// Split the input content into tokens using any whitespace character as a delimiter.
const inputTokens = sourceData.split(/\s+/).filter(Boolean); // Filter out empty strings
let tokenPointer = 0; // Pointer to the current token being processed.

/**
 * Retrieves and parses the next token from the input stream as an integer.
 * Throws an error if no more tokens are available or if the token is not a valid number.
 * @returns {number} The parsed integer value.
 * @throws {Error} If input tokens are exhausted or parsing fails.
 */
function fetchNextNumericToken() {
    if (tokenPointer >= inputTokens.length) {
        throw new Error("Input stream exhausted: Attempted to read beyond available tokens.");
    }
    const currentToken = inputTokens[tokenPointer++];
    const parsedValue = parseInt(currentToken, 10);

    if (isNaN(parsedValue)) {
        throw new Error(`Failed to parse token '${currentToken}' at index ${tokenPointer - 1} as a number.`);
    }
    return parsedValue;
}

/**
 * A class implementing the Disjoint Set Union (DSU) data structure,
 * also known as Union-Find. It tracks a collection of disjoint sets
 * and supports operations to merge sets and find the representative
 * of an element's set.
 */
class DisjointSetCollection {
    /** @type {number[]} An array where parentArray[i] stores the parent of element i. */
    parentArray;
    /** @type {number[]} An array where componentSizesMap[i] stores the size of the set if i is a root. */
    componentSizesMap;
    /** @type {number} The current number of distinct, disjoint sets. */
    distinctSetCount;

    /**
     * Initializes a new DisjointSetCollection with `itemCount` elements,
     * where each element initially belongs to its own set.
     * @param {number} itemCount The total number of elements to manage.
     * @throws {Error} If itemCount is not a non-negative number.
     */
    constructor(itemCount) {
        if (typeof itemCount !== 'number' || itemCount < 0 || !Number.isInteger(itemCount)) {
            throw new Error(`Invalid item count provided: ${itemCount}. Must be a non-negative integer.`);
        }

        this.parentArray = new Array(itemCount);
        this.componentSizesMap = new Array(itemCount);
        this.distinctSetCount = itemCount;

        // Each element starts as its own parent and a set of size 1.
        for (let idx = 0; idx < itemCount; ++idx) {
            this.parentArray[idx] = idx;
            this.componentSizesMap[idx] = 1;
        }
    }

    /**
     * Finds the representative (root) of the set containing the given element.
     * Implements path compression for efficiency.
     * @param {number} elementIdentifier The element whose set representative is to be found.
     * @returns {number} The representative (root) of the element's set.
     */
    findSetRepresentative(elementIdentifier) {
        // Base case: if an element is its own parent, it's the root.
        if (this.parentArray[elementIdentifier] === elementIdentifier) {
            return elementIdentifier;
        }

        // Recursive call with path compression: set the element's parent directly to the root.
        this.parentArray[elementIdentifier] = this.findSetRepresentative(this.parentArray[elementIdentifier]);
        return this.parentArray[elementIdentifier];
    }

    /**
     * Merges the sets containing `nodeA` and `nodeB`.
     * Uses union by size heuristic to maintain tree balance.
     * @param {number} nodeA An element in the first set.
     * @param {number} nodeB An element in the second set.
     */
    mergeSets(nodeA, nodeB) {
        const rootA = this.findSetRepresentative(nodeA);
        const rootB = this.findSetRepresentative(nodeB);

        // If elements are already in the same set, do nothing.
        if (rootA === rootB) {
            return;
        }

        // Union by size: attach the smaller tree to the root of the larger tree.
        if (this.componentSizesMap[rootA] < this.componentSizesMap[rootB]) {
            this.parentArray[rootA] = rootB;
            this.componentSizesMap[rootB] += this.componentSizesMap[rootA];
        } else {
            this.parentArray[rootB] = rootA;
            this.componentSizesMap[rootA] += this.componentSizesMap[rootB];
        }

        // Decrement the count of distinct sets as two sets have merged into one.
        this.distinctSetCount--;
    }

    /**
     * Checks if two elements are connected (i.e., belong to the same disjoint set).
     * @param {number} nodeA The first element.
     * @param {number} nodeB The second element.
     * @returns {boolean} True if both elements are in the same set, false otherwise.
     */
    areElementsConnected(nodeA, nodeB) {
        return this.findSetRepresentative(nodeA) === this.findSetRepresentative(nodeB);
    }

    /**
     * Returns the current number of distinct sets in the collection.
     * @returns {number} The total count of disjoint sets.
     */
    getSetCount() {
        return this.distinctSetCount;
    }
}

/**
 * Main function to execute the Disjoint Set Union operations based on input queries.
 * Reads initial parameters (total elements, number of queries) and then processes
 * each query to either merge sets or check connectivity.
 */
function runSolver() {
    let totalElements;
    let numQueries;

    try {
        totalElements = fetchNextNumericToken();
        numQueries = fetchNextNumericToken();
    } catch (e) {
        console.error("Error reading initial parameters:", e.message);
        return; // Exit if initial parameters can't be read.
    }

    // Basic validation for initial parameters.
    if (totalElements < 0 || numQueries < 0) {
        console.error(`Invalid initial parameters: totalElements=${totalElements}, numQueries=${numQueries}. Both must be non-negative.`);
        return;
    }

    const dsuManager = new DisjointSetCollection(totalElements);

    // Process each query.
    for (let queryIndex = 0; queryIndex < numQueries; ++queryIndex) {
        let queryType, elementOneIdx, elementTwoIdx;
        try {
            queryType = fetchNextNumericToken();
            elementOneIdx = fetchNextNumericToken();
            elementTwoIdx = fetchNextNumericToken();
        } catch (e) {
            console.error(`Error reading query ${queryIndex + 1}:`, e.message);
            continue; // Skip to the next query if current one is malformed.
        }

        // Validate element indices to prevent out-of-bounds access.
        if (elementOneIdx < 0 || elementOneIdx >= totalElements ||
            elementTwoIdx < 0 || elementTwoIdx >= totalElements) {
            console.error(`Query ${queryIndex + 1}: Invalid element indices provided (0 to ${totalElements - 1} expected). Got ${elementOneIdx}, ${elementTwoIdx}. Skipping.`);
            continue;
        }

        // Perform action based on the query type.
        switch (queryType) {
            case 0: // Merge operation
                dsuManager.mergeSets(elementOneIdx, elementTwoIdx);
                break;
            case 1: // Connectivity check operation
                const areConnected = dsuManager.areElementsConnected(elementOneIdx, elementTwoIdx);
                console.log(areConnected ? 1 : 0); // Output 1 for connected, 0 for not connected.
                break;
            default: // Unknown query type
                console.error(`Query ${queryIndex + 1}: Unknown query type '${queryType}'. Expected 0 (merge) or 1 (check). Skipping.`);
                break;
        }
    }
}

// Initiate the program execution.
runSolver();