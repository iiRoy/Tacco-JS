"use strict"; /* This directive enforces stricter parsing and error handling in the code. */

// Module for file system operations.
const rawDataSource = require('node:fs');

// Read raw input data from standard input using UTF-8 encoding.
let rawData = rawDataSource.readFileSync("/dev/stdin", 'utf-8');

// Split the input data into a stream of tokens using any whitespace as a delimiter.
let tokenStream = rawData.split(/\s+/);

// Initialize a pointer to the current token in the stream.
let currentIndex = 0;

/**
 * Retrieves the next token from the stream and converts it to a numeric value.
 * @returns {number} The next number parsed from the input stream.
 */
function getNextNumber ( ) {
    return Number(tokenStream[currentIndex++]);
}

/**
 * Retrieves the subsequent token from the stream as a string.
 * @returns {string} The next string token from the input.
 */
function getNextString ( ) {
    return tokenStream[currentIndex++];
}

/**
 * Fetches the next token and parses it into a BigInt data type.
 * @returns {BigInt} The next BigInt value from the input.
 */
function getNextBigInt ( ) {
    return BigInt(tokenStream[currentIndex++]);
}

/**
 * Extracts a specified number of elements from the token stream.
 * @param {number} count - The quantity of elements to retrieve.
 * @param {boolean} asStrings - If set to true, elements are returned as strings; otherwise, they are converted to numbers.
 * @returns {Array<string|number>} An array containing the retrieved elements.
 */
function getMultipleElements ( count, asStrings ) {
    const elements = tokenStream.slice(currentIndex, currentIndex + count);
    currentIndex += count;
    return asStrings ? elements : elements.map(val => Number(val));
}

/**
 * Retrieves a specified quantity of numerical elements from the stream, then sorts them.
 * @param {number} numElements - The total number of numerical elements to extract.
 * @param {boolean} descending - If true, the numbers are sorted in descending order; otherwise, in ascending order.
 * @returns {Array<number>} An array of the sorted numerical elements.
 */
function getSortedNumbers ( numElements, descending ) {
    const elements = tokenStream.slice( currentIndex, currentIndex + numElements ).map( val => Number(val) );
    currentIndex += numElements;
    return descending ? elements.sort( (val1, val2) => val2 - val1 ) : elements.sort( (val1, val2) => val1 - val2 );
}

/**
 * Constructs a 2D array (matrix) by reading values from the token stream.
 * @param {number} height - The desired number of rows for the matrix.
 * @param {number} width - The desired number of columns for each row.
 * @param {boolean} stringMatrix - If true, matrix cells remain as strings; otherwise, they are converted to numbers.
 * @returns {Array<Array<string|number>>} The generated matrix.
 */
function getMatrix ( height, width, stringMatrix ) {
    let resultRows = [];
    let rowIndex = 0;
    if ( stringMatrix ) {
        for ( ; rowIndex < height; rowIndex++ ) {
            resultRows.push(tokenStream.slice(currentIndex, currentIndex += width));
        }
    } else {
        for ( ; rowIndex < height; rowIndex++ ) {
            resultRows.push(tokenStream.slice(currentIndex, currentIndex += width).map( cell => Number(cell) ));
        }
    }
    return resultRows;
}

/**
 * Generates a multi-dimensional array dynamically based on provided dimensions and an initial value.
 * @param {*} initialValue - The value to populate the innermost arrays.
 * @param {number[]} dimensions - A list of integer dimensions for the array structure.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray ( initialValue ) {
    let dimensions = arguments;
    let dimIndex = dimensions.length;
    let arrayCreationString = `Array(dimensions[${--dimIndex}]).fill().map(_ => { return ${initialValue}; })`;
    while ( --dimIndex ) {
        arrayCreationString = `Array(dimensions[${dimIndex}]).fill().map(_ => ${arrayCreationString})`;
    }
    return eval(arrayCreationString);
}


/*
 * This class implements a Disjoint Set Union (DSU) data structure,
 * commonly referred to as a Union-Find algorithm. It efficiently manages
 * a collection of disjoint sets, allowing for quick union and find operations.
 */
class DisjointSetUnion {
    /**
     * Initializes the DSU structure for a given number of elements.
     * Each element is initially considered to be in its own distinct set.
     * @param {number} elementCount - The total number of elements to manage within the DSU.
     */
    constructor (elementCount) {
        // The parentOrSize array stores the parent index for each element,
        // or a negative value representing the size of the set if the element is a root.
        this.parentOrSize = Array.from({ length: elementCount + 1 }, () => -1);
    }

    /**
     * Determines the representative (root) of the set to which a given element belongs.
     * This method incorporates path compression for optimized performance.
     * @param {number} index - The index of the element for which to find the representative.
     * @returns {number} The index of the representative (root) of the element's set.
     */
    findRepresentative (index) {
        if (this.parentOrSize[index] < 0) {
            return index; // If value is negative, it's a root.
        }
        // Recursively find the root and perform path compression:
        // Set the element's parent directly to the discovered root.
        return this.parentOrSize[index] = this.findRepresentative(this.parentOrSize[index]);
    }

    /**
     * Checks whether two specified elements are part of the same disjoint set.
     * @param {number} nodeA - The index of the first element.
     * @param {number} nodeB - The index of the second element.
     * @returns {boolean} True if both elements belong to the identical set, false otherwise.
     */
    areConnected (nodeA, nodeB) {
        return this.findRepresentative(nodeA) === this.findRepresentative(nodeB);
    }

    /**
     * Merges the sets containing two given elements into a single set.
     * This operation uses the union by size heuristic to maintain a balanced tree structure.
     * @param {number} nodeX - The index of the first element.
     * @param {number} nodeY - The index of the second element.
     * @returns {boolean} True if the union operation successfully merged two distinct sets,
     *                    false if the elements were already in the same set.
     */
    unionSets (nodeX, nodeY) {
        const dsArray = this.parentOrSize; // Reference to the internal array for convenience.
        nodeX = this.findRepresentative(nodeX);
        nodeY = this.findRepresentative(nodeY);

        // If the representatives are the same, the elements are already in the same set.
        if (nodeX === nodeY) {
            return false;
        }

        // Apply union by size heuristic: attach the smaller tree under the root of the larger tree.
        if (dsArray[nodeY] < dsArray[nodeX]) { // If nodeY's set is larger (more negative size).
            dsArray[nodeY] += dsArray[nodeX]; // Aggregate sizes.
            dsArray[nodeX] = nodeY;            // Make nodeY the parent of nodeX.
        } else { // If nodeX's set is larger or equal in size.
            dsArray[nodeX] += dsArray[nodeY]; // Aggregate sizes.
            dsArray[nodeY] = nodeX;            // Make nodeX the parent of nodeY.
        }
        return true; // The sets were successfully merged.
    }

    /**
     * Calculates and returns the total number of elements within the set that contains the specified element.
     * @param {number} elementIdx - The index of the element whose set size is to be determined.
     * @returns {number} The count of elements in the set containing 'elementIdx'.
     */
    getSetSize (elementIdx) {
        return -this.parentOrSize[this.findRepresentative(elementIdx)];
    }
}

// Invoke the main logic of the program and store its output.
var programResult = executeMainLogic();

// If the execution of the main logic yielded a defined result, print it to standard output.
if (programResult !== undefined) {
    console.log(String(programResult));
}

/**
 * This function serves as the primary entry point for the application's core logic.
 * It reads graph data, processes connections using a Disjoint Set Union structure,
 * and determines the size of the largest connected component.
 * @returns {number} The negative value of the size of the largest connected component within the graph.
 */
function executeMainLogic() {
    // Read the total number of vertices (nodes) and the number of edges from the input.
    let vertexCount = getNextNumber();
    let edgeCount = getNextNumber();

    // Instantiate a Disjoint Set Union data structure to manage connectivity among vertices.
    let dsuStructure = new DisjointSetUnion(vertexCount);

    // Iterate through each edge provided in the input.
    for (let loopCounter = 0; loopCounter < edgeCount; loopCounter++) {
        // For each iteration, read the two nodes that form the current edge.
        let [node1, node2] = getMultipleElements(2);
        // Connect these two nodes within the DSU structure, effectively merging their sets.
        dsuStructure.unionSets(node1, node2);
    }

    // After processing all edges, the `parentOrSize` array at root indices
    // will contain negative values representing the sizes of the connected components.
    // To find the largest component, we find the minimum (most negative) value.
    // The result is then negated to return the positive size of this largest component.
    return -Math.min(...dsuStructure.parentOrSize);
}