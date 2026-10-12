var parentArray = []; // This array will store the parent of each element in the Disjoint Set Union structure.

/**
 * Sets up the initial state of the DSU for a specified number of items.
 * Each item is initially considered to be in its own distinct set.
 * @param {number} countElements - The total quantity of elements to manage.
 */
function initializeStructure(countElements) {
    for (let idx = 0; idx < countElements; idx++) {
        parentArray[idx] = idx; // Assign each element as its own parent.
    }
}

/**
 * Discovers the representative (root) of the set to which a given element belongs.
 * This function employs path compression for enhanced performance.
 * @param {number} elementIndex - The numerical identifier of the element.
 * @returns {number} The identifier of the root element for the set.
 */
function findRoot(elementIndex) {
    if (parentArray[elementIndex] === elementIndex) {
        return elementIndex; // If an element is its own parent, it is the root.
    }
    // Recursively find the root and perform path compression.
    parentArray[elementIndex] = findRoot(parentArray[elementIndex]);
    return parentArray[elementIndex];
}

/**
 * Determines whether two specified elements are part of the same connected set.
 * @param {number} firstElement - The identifier for the first element.
 * @param {number} secondElement - The identifier for the second element.
 * @returns {boolean} Returns true if both elements share the same root, false otherwise.
 */
function areConnected(firstElement, secondElement) {
    return findRoot(firstElement) === findRoot(secondElement);
}

/**
 * Merges the sets containing two distinct elements into a single set.
 * This operation effectively connects the two elements.
 * @param {number} elemA - The identifier of the first element to unite.
 * @param {number} elemB - The identifier of the second element to unite.
 */
function uniteSets(elemA, elemB) {
    let rootA = findRoot(elemA); // Find the root of the first element's set.
    let rootB = findRoot(elemB); // Find the root of the second element's set.

    if (rootA === rootB) {
        return; // If they already share the same root, no action is needed.
    }
    parentArray[rootA] = rootB; // Make the root of the first set a child of the second set's root.
}


// --- Program entry point for processing input and queries ---

// Access the file system module to read standard input.
const fsModule = require('fs');
let rawData = fsModule.readFileSync('/dev/stdin', 'utf8').trim();
let inputLines = rawData.split('\n'); // Divide the input into individual lines.

// Extract the initial configuration parameters (N and Q) from the first line.
let firstLineParts = inputLines.shift().trim().split(' ');
let numNodes = +firstLineParts[0]; // Convert the string representation of N to a number.
let numQueries = +firstLineParts[1]; // Convert the string representation of Q to a number.

// Prepare the DSU structure based on the number of nodes.
initializeStructure(numNodes);

let currentLineData;
// Iterate through the remaining lines, each representing a query.
while (currentLineData = inputLines.shift()) {
    let commandParts = currentLineData.trim().split(' ');
    const operationType = +commandParts[0]; // Determine the type of operation (0 for union, 1 for check).

    if (operationType === 0) {
        // Execute a union operation to connect two elements.
        uniteSets(+commandParts[1], +commandParts[2]); // Ensure element identifiers are numbers.
    } else {
        // Execute a connectivity check and print the result (1 for connected, 0 for not).
        console.log(areConnected(+commandParts[1], +commandParts[2]) ? 1 : 0);
    }
}
