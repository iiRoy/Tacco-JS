"use strict";

// This script processes input from standard input to perform Disjoint Set Union operations.

// Acquire all input data from the standard input stream.
let dataSource = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input into tokens, using spaces and newlines as delimiters.
let tokenStream = dataSource.split(/ |\n/);

// Initialize an index to keep track of the current token being processed.
let tokenIndex = 0;

// Function to retrieve the next token as a numeric value.
function getNextNumber() {
    return +tokenStream[tokenIndex++];
}

// Function to retrieve the next token as a string.
function getNextString() {
    return tokenStream[tokenIndex++];
}

// Function to retrieve the next token as a BigInt value.
function getNextBigInt() {
    return BigInt(tokenStream[tokenIndex++]);
}

// Function to retrieve a specified count of tokens, optionally as strings.
function getMultipleNumbers(count, asStrings) {
    if (asStrings) {
        return tokenStream.slice(tokenIndex, tokenIndex += count);
    } else {
        return tokenStream.slice(tokenIndex, tokenIndex += count).map(value => +value);
    }
}

// Function to retrieve and sort a specified amount of numbers.
// Sorting can be ascending (default) or descending.
function getSortedNumbers(amount, descending) {
    let rawNumbers = tokenStream.slice(tokenIndex, tokenIndex += amount).map(value => +value);
    if (descending) {
        return rawNumbers.sort((valA, valB) => valB - valA); // Descending sort
    } else {
        return rawNumbers.sort((valA, valB) => valA - valB); // Ascending sort
    }
}

// Function to parse a matrix of numbers or strings from the input stream.
function getMatrix(rows, cols, asStrings) {
    let matrixData = [];
    let rowCounter = 0;
    if (asStrings) {
        for (; rowCounter < rows; ++rowCounter) {
            matrixData.push(tokenStream.slice(tokenIndex, tokenIndex += cols));
        }
    } else {
        for (; rowCounter < rows; ++rowCounter) {
            matrixData.push(tokenStream.slice(tokenIndex, tokenIndex += cols).map(value => +value));
        }
    }
    return matrixData;
}

// Function to create a multi-dimensional array with an initial value.
// This uses eval and is generally not recommended for untrusted input.
function createMultiDimArray(initialValue) {
    let argumentList = arguments;
    let dimensionCount = argumentList.length;
    let generatedCode = "Array(argumentList[" + --dimensionCount + "]).fill().map(element => {return " + initialValue + ";})";
    while (--dimensionCount) {
        generatedCode = "Array(argumentList[" + dimensionCount + "]).fill().map(element =>" + generatedCode + ")";
    }
    return eval(generatedCode);
}


// Implementation of a Disjoint Set Union (DSU) data structure.
class DisjointSetUnion {
    // Constructor initializes the structure for 'elementCount' elements.
    constructor(elementCount) {
        // 'parentOrSize' array stores parent pointers or negative size of the set if it's a root.
        this.parentOrSize = Array(elementCount + 1).fill(-1);
    }

    // Finds the representative (root) of the set containing 'itemIndex'.
    // Performs path compression for efficiency.
    findRepresentative(itemIndex) {
        if (this.parentOrSize[itemIndex] < 0) {
            return itemIndex; // 'itemIndex' is a root.
        }
        // Path compression: set parent directly to the root.
        return this.parentOrSize[itemIndex] = this.findRepresentative(this.parentOrSize[itemIndex]);
    }

    // Checks if two elements 'firstElement' and 'secondElement' belong to the same set.
    areConnected(firstElement, secondElement) {
        return this.findRepresentative(firstElement) === this.findRepresentative(secondElement);
    }

    // Unites the sets containing 'firstElement' and 'secondElement'.
    // Uses union by size heuristic.
    unionSets(firstElement, secondElement) {
        const structureArray = this.parentOrSize; // Alias for convenience.

        // Find representatives of the two elements.
        let firstElementRep = this.findRepresentative(firstElement);
        let secondElementRep = this.findRepresentative(secondElement);

        // If they are already in the same set, do nothing.
        if (firstElementRep === secondElementRep) {
            return false;
        }

        // Union by size: attach smaller tree under the root of the larger tree.
        if (structureArray[secondElementRep] < structureArray[firstElementRep]) {
            // Second tree is larger (more negative size), so attach first under second.
            structureArray[secondElementRep] += structureArray[firstElementRep];
            structureArray[firstElementRep] = secondElementRep;
        } else {
            // First tree is larger or equal, so attach second under first.
            structureArray[firstElementRep] += structureArray[secondElementRep];
            structureArray[secondElementRep] = firstElementRep;
        }
        return true; // Sets were successfully united.
    }

    // Returns the size of the set containing 'itemIndex'.
    getSetSize(itemIndex) {
        // The size is stored as a negative value at the root.
        return -this.parentOrSize[this.findRepresentative(itemIndex)];
    }
}


// Execute the primary logic and capture its output.
let resultOfProcessing = processQueries();

// If there is a return value from the main function, print it to console.
if (resultOfProcessing !== undefined) {
    console.log(String(resultOfProcessing));
}


// The main function where query processing occurs.
function processQueries() {
    // Read the total number of elements and queries.
    let [totalElements, totalQueries] = getMultipleNumbers(2);

    // Instantiate the Disjoint Set Union structure.
    let dsuInstance = new DisjointSetUnion(totalElements);

    // Array to store the outcomes of 'same set' queries.
    let queryOutcomes = [];

    // Process each query one by one.
    for (let counter = 0; counter < totalQueries; ++counter) {
        // Read the query type and the two elements involved.
        let [queryType, elementA, elementB] = getMultipleNumbers(3);

        // Check the query type.
        if (queryType === 1) {
            // Type 1 query: Check if elements are connected.
            if (dsuInstance.areConnected(elementA, elementB)) {
                queryOutcomes.push(1); // Connected
            } else {
                queryOutcomes.push(0); // Not connected
            }
        } else {
            // Type 0 query: Union the sets containing the two elements.
            dsuInstance.unionSets(elementA, elementB);
        }
    }

    // Join all query outcomes with newlines and return the string.
    return queryOutcomes.join("\n");
}