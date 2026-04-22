const fileSystemModule = require("node:fs");
const rawInputData = fileSystemModule.readFileSync("/dev/stdin", { encoding: "utf8" });

// Input processing utilities
const parsedTokens = rawInputData.trim().split(/\s+/);
let tokenPointer = 0;

const getNextInteger = () => Number(parsedTokens[tokenPointer++]);
const getNextString = () => parsedTokens[tokenPointer++];
const getNextBigInt = () => BigInt(parsedTokens[tokenPointer++]);

// Helper for reading arrays of numbers or strings
const readItemsAsArray = (count, convertToNumber = false) => {
    const collectedItems = [];
    for (let i = 0; i < count; ++i) {
        collectedItems.push(convertToNumber ? Number(parsedTokens[tokenPointer++]) : parsedTokens[tokenPointer++]);
    }
    return collectedItems;
};

// Helper for reading 2D matrices
const readMatrixData = (rows, cols, convertToNumber = false) => {
    const matrix = [];
    for (let r = 0; r < rows; ++r) {
        const rowData = [];
        for (let c = 0; c < cols; ++c) {
            rowData.push(convertToNumber ? Number(parsedTokens[tokenPointer++]) : parsedTokens[tokenPointer++]);
        }
        matrix.push(rowData);
    }
    return matrix;
};

// Binary Indexed Tree (Fenwick Tree) implementation
class IndexedTree {
    // Initializes the tree with a given size, filled with zeros.
    constructor(arraySize) {
        this.storageArray = new Array(arraySize + 1).fill(0);
    }

    // Adds a value to a specific index and updates ancestors.
    modifyValue(valueToAdd, indexPosition) {
        for (let currentIdx = indexPosition; currentIdx < this.storageArray.length; currentIdx += currentIdx & -currentIdx) {
            this.storageArray[currentIdx] += valueToAdd;
        }
    }

    // Queries the prefix sum up to a specific index.
    queryPrefixSum(indexPosition) {
        let cumulativeSum = 0;
        for (let currentIdx = indexPosition; currentIdx > 0; currentIdx -= currentIdx & -currentIdx) {
            cumulativeSum += this.storageArray[currentIdx];
        }
        return cumulativeSum;
    }
}

// Main execution block
const applicationOutput = executePrimaryLogic();
if (applicationOutput !== undefined) {
    console.log(String(applicationOutput));
}

// The core logic function
function executePrimaryLogic() {
    const numberOfElements = getNextInteger();
    const numberOfQueries = getNextInteger();
    const elementColors = readItemsAsArray(numberOfElements, true); // Read colors as numbers

    // `colorOccurrences` stores lists of 1-based indices for each color.
    // The first element of each inner array acts as a pointer/counter for the next available position.
    const colorOccurrences = Array.from({ length: numberOfElements }, () => [1]); // Initialize each with [1]

    const fenwickInstance = new IndexedTree(numberOfElements + 1);
    const uniqueColorsSeen = new Set(); // To track distinct colors encountered at their first occurrence

    // Populate colorOccurrences and the Fenwick tree
    for (let elementIndex = 0; elementIndex < numberOfElements; ++elementIndex) {
        const currentElementColor = elementColors[elementIndex];
        elementColors[elementIndex] = currentElementColor - 1; // Adjust to 0-based indexing for colors

        const zeroBasedColor = elementColors[elementIndex];
        colorOccurrences[zeroBasedColor].push(elementIndex + 1); // Store 1-based position

        // If this is the first time we see this color, add it to the Fenwick tree
        if (!uniqueColorsSeen.has(zeroBasedColor)) {
            uniqueColorsSeen.add(zeroBasedColor);
            fenwickInstance.modifyValue(1, elementIndex + 1);
        }
    }

    // Add a sentinel value (numberOfElements + 1) to the end of each color's position list.
    // This helps in handling queries where the next occurrence is beyond the array bounds.
    for (let colorIdx = 0; colorIdx < numberOfElements; ++colorIdx) {
        colorOccurrences[colorIdx].push(numberOfElements + 1);
    }

    // Read and store all query requests
    const queryRequests = [];
    for (let queryIdx = 0; queryIdx < numberOfQueries; ++queryIdx) {
        const leftBoundary = getNextInteger();
        const rightBoundary = getNextInteger();
        queryRequests.push([leftBoundary, rightBoundary, queryIdx]); // Store [L, R, original_index]
    }

    // Sort queries by their left boundary for the sliding window approach
    queryRequests.sort((queryA, queryB) => queryA[0] - queryB[0]);

    const queryResults = new Array(numberOfQueries);
    let currentWindowLeftPointer = 1; // 1-based index for the sliding window's left edge

    // Process each query
    for (const currentQuery of queryRequests) {
        const [queryLeft, queryRight, originalQueryIndex] = currentQuery;

        // Slide the window's left pointer until it reaches the current query's left boundary
        while (currentWindowLeftPointer < queryLeft) {
            const colorAtCurrentLeft = elementColors[currentWindowLeftPointer - 1]; // Get 0-based color

            // Increment the internal pointer for this color's occurrences
            colorOccurrences[colorAtCurrentLeft][0]++;
            // Get the next occurrence's position (1-based)
            const nextOccurrencePosition = colorOccurrences[colorAtCurrentLeft][colorOccurrences[colorAtCurrentLeft][0]];

            // Remove the current (old) position from the Fenwick tree
            fenwickInstance.modifyValue(-1, currentWindowLeftPointer);
            // Add the next occurrence's position to the Fenwick tree
            fenwickInstance.modifyValue(1, nextOccurrencePosition);

            currentWindowLeftPointer++; // Move the window's left pointer
        }

        // The answer for this query is the sum in the Fenwick tree up to the query's right boundary
        queryResults[originalQueryIndex] = fenwickInstance.queryPrefixSum(queryRight);
    }

    // Join the results with newline characters
    return queryResults.join("\n");
}