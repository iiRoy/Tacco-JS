// This JavaScript code implements a Disjoint Set Union (DSU) data structure
// and uses it to solve a problem involving connected components.

/**
 * DisjointSetCollection class manages a collection of disjoint sets,
 * facilitating efficient union and find operations. It incorporates
 * path compression and union by rank optimizations for better performance.
 */
class DisjointSetCollection {
    // #parentNodes[i] stores the parent of element i.
    // If #parentNodes[i] === i, then element i is the representative (root) of its set.
    #parentNodes;

    // #rankArray[i] stores the rank (or approximate height) of the tree rooted at i.
    // This is used in the union operation to attach the shorter tree to the taller one,
    // thereby keeping the overall tree structure relatively flat.
    #rankArray;

    // #setCount tracks the current number of distinct, disjoint sets.
    #setCount;

    /**
     * Constructs a new DisjointSetCollection instance.
     * Initially, each of the 'totalElements' elements is in its own distinct set.
     * @param {number} totalElements - The total number of elements this DSU structure will manage.
     *                                 Must be a non-negative integer.
     */
    constructor(totalElements) {
        // Validate the input to ensure a proper initialization.
        if (typeof totalElements !== 'number' || !Number.isInteger(totalElements) || totalElements < 0) {
            throw new Error("Initialization error: 'totalElements' must be a non-negative integer.");
        }

        // Initialize each element to be its own parent (representative).
        this.#parentNodes = Array.from({ length: totalElements }, (_, index) => index);
        // Initialize all ranks to 0.
        this.#rankArray = new Array(totalElements).fill(0);
        // Initially, there are 'totalElements' distinct sets.
        this.#setCount = totalElements;
    }

    /**
     * Determines the representative (root) of the set that 'elementIndex' belongs to.
     * This method recursively traverses up the parent chain until it finds the root.
     * During traversal, it performs path compression by making all visited nodes
     * point directly to the root, optimizing future lookups.
     * @param {number} elementIndex - The 0-based index of the element to query.
     * @returns {number} The 0-based index of the representative of the set.
     */
    findSet(elementIndex) {
        // Ensure the element index is within the valid range.
        if (elementIndex < 0 || elementIndex >= this.#parentNodes.length) {
            throw new Error(`Invalid element index: ${elementIndex} is out of bounds [0, ${this.#parentNodes.length - 1}].`);
        }

        // If the element is its own parent, it is the root of its set.
        if (this.#parentNodes[elementIndex] === elementIndex) {
            return elementIndex;
        }

        // Recursively find the root and apply path compression.
        // The parent of 'elementIndex' is updated to point directly to the found root.
        this.#parentNodes[elementIndex] = this.findSet(this.#parentNodes[elementIndex]);
        return this.#parentNodes[elementIndex];
    }

    /**
     * Merges the sets containing 'firstElement' and 'secondElement' into a single set.
     * This operation uses the union by rank heuristic to maintain a balanced tree structure,
     * which helps to keep the height of the trees small and find operations efficient.
     * If both elements are already in the same set, no action is taken.
     * @param {number} firstElement - The 0-based index of the first element.
     * @param {number} secondElement - The 0-based index of the second element.
     */
    union(firstElement, secondElement) {
        // Find the representatives of the sets containing firstElement and secondElement.
        let representativeA = this.findSet(firstElement);
        let representativeB = this.findSet(secondElement);

        // If the representatives are different, the elements are in different sets and need to be merged.
        if (representativeA !== representativeB) {
            // Apply union by rank: attach the tree with the smaller rank under the root of the tree with the larger rank.
            if (this.#rankArray[representativeA] < this.#rankArray[representativeB]) {
                this.#parentNodes[representativeA] = representativeB;
            } else if (this.#rankArray[representativeA] > this.#rankArray[representativeB]) {
                this.#parentNodes[representativeB] = representativeA;
            } else {
                // If ranks are equal, pick one as the new root (e.g., representativeA)
                // and increment its rank, as the height of the merged tree has increased.
                this.#parentNodes[representativeB] = representativeA;
                this.#rankArray[representativeA]++;
            }
            // A merge operation reduces the total number of disjoint sets by one.
            this.#setCount--;
        }
        // If representativeA === representativeB, the elements are already in the same set, so do nothing.
    }

    /**
     * Checks whether two elements belong to the same disjoint set.
     * This is determined by comparing their representatives.
     * @param {number} elementX - The 0-based index of the first element.
     * @param {number} elementY - The 0-based index of the second element.
     * @returns {boolean} True if both elements are in the same set, false otherwise.
     */
    isSameSet(elementX, elementY) {
        return this.findSet(elementX) === this.findSet(elementY);
    }

    /**
     * Returns the current total number of distinct, disjoint sets.
     * @returns {number} The count of disjoint sets.
     */
    getSetCount() {
        return this.#setCount;
    }
}

/**
 * Utility function to convert an array of string numbers into an array of actual numbers.
 * @param {string[]} stringArray - An array where each element is a string representation of a number.
 * @returns {number[]} An array of numbers.
 */
const parseNumericStrings = (stringArray) => stringArray.map(Number);

/**
 * The main function that processes the problem input, performs DSU operations,
 * and computes the final result.
 * @param {string} inputData - The entire input as a single string, typically read from stdin.
 */
function solveProblem(inputData) {
    // Validate input data presence.
    if (!inputData || inputData.trim() === "") {
        console.error("Error: Received empty or invalid input data.");
        return;
    }

    // Split the input into individual lines and remove any leading/trailing whitespace.
    let processedLines = inputData.trim().split("\n");

    // Extract the first line containing N (number of elements) and M (number of union operations).
    const firstParameterLine = processedLines.shift();
    if (!firstParameterLine) {
        console.error("Error: The first line specifying N and M is missing from input.");
        return;
    }
    const systemParameters = parseNumericStrings(firstParameterLine.split(/\s+/));

    // Validate the number of parameters on the first line.
    if (systemParameters.length < 2) {
        console.error("Error: Insufficient parameters on the first line. Expected N and M.");
        return;
    }

    const numElements = systemParameters[0];
    const numUnionOperations = systemParameters[1];

    // Perform validation on N and M values.
    if (numElements <= 0 || !Number.isInteger(numElements)) {
        console.error(`Error: Invalid value for N (${numElements}). N must be a positive integer.`);
        return;
    }
    if (numUnionOperations < 0 || !Number.isInteger(numUnionOperations)) {
        console.error(`Error: Invalid value for M (${numUnionOperations}). M must be a non-negative integer.`);
        return;
    }
    // Add an arbitrary warning for potentially large N, as DSU performance can be sensitive to scale.
    if (numElements > 200000) {
        console.warn(`Warning: Number of elements (N=${numElements}) is quite large. Performance might be a concern.`);
    }

    // Initialize the Disjoint Set Union structure with 'numElements' elements.
    const setManagementSystem = new DisjointSetCollection(numElements);

    // Extract the second line which contains the permutation array P.
    const permutationDefinitionLine = processedLines.shift();
    if (!permutationDefinitionLine) {
        console.error("Error: The line defining the target permutation (P) is missing.");
        return;
    }
    const targetPermutation = parseNumericStrings(permutationDefinitionLine.split(/\s+/));

    // Validate the length of the permutation array.
    if (targetPermutation.length !== numElements) {
        console.error(`Error: Mismatch in permutation array length. Expected ${numElements} elements, found ${targetPermutation.length}.`);
        return;
    }

    // Collect all union operation pairs. This pre-processing step separates parsing from execution.
    const operationsToPerform = [];
    for (let opIdx = 0; opIdx < numUnionOperations; opIdx++) {
        const currentOperationLine = processedLines.shift();
        if (!currentOperationLine) {
            console.error(`Error: Missing line for union operation ${opIdx + 1}.`);
            // Attempt to continue if possible, or exit based on problem requirements. Here, we'll exit.
            return;
        }
        const [nodeOne, nodeTwo] = parseNumericStrings(currentOperationLine.split(/\s+/));

        // Convert 1-based problem input indices to 0-based indices for DSU.
        const adjustedNodeOne = nodeOne - 1;
        const adjustedNodeTwo = nodeTwo - 1;

        // Validate that the nodes for union operations are within bounds.
        if (adjustedNodeOne < 0 || adjustedNodeOne >= numElements ||
            adjustedNodeTwo < 0 || adjustedNodeTwo >= numElements) {
            console.error(`Error: Invalid node indices (${nodeOne}, ${nodeTwo}) for union operation on line ${opIdx + 1}. Skipping this operation.`);
            continue; // Skip this specific invalid union operation.
        }
        operationsToPerform.push([adjustedNodeOne, adjustedNodeTwo]);
    }

    // Execute the collected union operations.
    for (const [n1, n2] of operationsToPerform) {
        setManagementSystem.union(n1, n2);
    }

    // Count the number of elements 'k' where 'k' and 'targetPermutation[k]-1' are in the same set.
    let matchingComponentCount = 0;
    for (let currentElementIdx = 0; currentElementIdx < numElements; currentElementIdx++) {
        // Adjust the target permutation value from 1-based to 0-based indexing.
        const targetValueAdjusted = targetPermutation[currentElementIdx] - 1;

        // Perform bounds check for the adjusted target value.
        if (targetValueAdjusted < 0 || targetValueAdjusted >= numElements) {
            console.warn(`Warning: Target permutation value P[${currentElementIdx}]-1 (value: ${targetValueAdjusted}) is out of valid range for N=${numElements}. Skipping check.`);
            continue;
        }

        // Check if the current element and its corresponding target element are in the same set.
        if (setManagementSystem.isSameSet(currentElementIdx, targetValueAdjusted)) {
            matchingComponentCount++;
        }
    }

    // Output the final calculated count.
    console.log(matchingComponentCount);
}

// Entry point for execution: reads from standard input and calls the solver.
try {
    // Dynamically require the 'fs' module for file system operations.
    const fileSystemModule = require("fs");
    const standardInputPath = "/dev/stdin"; // Standard input file path on Unix-like systems.
    const fileContent = fileSystemModule.readFileSync(standardInputPath, "utf8");
    solveProblem(fileContent);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or problem execution.
    console.error("An unhandled error occurred during program execution:");
    console.error(`Error type: ${executionError.name}, Message: ${executionError.message}`);
    // Provide specific guidance for common errors like file not found.
    if (executionError.code === 'ENOENT') {
        console.error("Hint: The input file '/dev/stdin' could not be found or accessed. Ensure input is being piped correctly.");
    }
}