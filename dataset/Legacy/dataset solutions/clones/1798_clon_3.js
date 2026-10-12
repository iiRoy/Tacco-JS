const fileSystem = require("fs");
const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";
const RADIX_DECIMAL = 10;
const QUERY_INDEX_ADJUSTMENT = 1; // Queries are 1-indexed, convert to 0-indexed

/**
 * Parses vector data from input lines.
 * Each vector consists of a value and a weight.
 * @param {string[]} lines - Array of input lines.
 * @param {number} count - Number of vectors to parse.
 * @param {number} startLineIdx - The starting line index in `lines` for vector data.
 * @returns {Object.<number, number[]>} An object where keys are 0-indexed vector IDs
 *                                      and values are arrays [value, weight].
 */
function parseVectorData(lines, count, startLineIdx) {
    const vectors = {};
    for (let i = 0; i < count; i++) {
        const lineParts = lines[startLineIdx + i].split(" ");
        const vectorValue = parseInt(lineParts[0], RADIX_DECIMAL);
        const vectorWeight = parseInt(lineParts[1], RADIX_DECIMAL);
        vectors[i] = [vectorValue, vectorWeight];
    }
    return vectors;
}

/**
 * Parses query data from input lines.
 * Each query specifies a starting vector index and a maximum allowed weight.
 * @param {string[]} lines - Array of input lines.
 * @param {number} count - Number of queries to parse.
 * @param {number} startLineIdx - The starting line index in `lines` for query data.
 * @returns {number[][]} An array of arrays, where each inner array is [initialVectorIndex, maxAllowedWeight].
 */
function parseQueryData(lines, count, startLineIdx) {
    const queries = [];
    for (let i = 0; i < count; i++) {
        const lineParts = lines[startLineIdx + i].split(" ");
        const initialVectorIndex = parseInt(lineParts[0], RADIX_DECIMAL) - QUERY_INDEX_ADJUSTMENT;
        const maxAllowedWeight = parseInt(lineParts[1], RADIX_DECIMAL);
        queries.push([initialVectorIndex, maxAllowedWeight]);
    }
    return queries;
}

/**
 * Computes the total value for a given query based on a starting vector index and weight limit.
 * The computation traverses up the "tree" by repeatedly halving the current index.
 * @param {number} initialIndex - The 0-indexed starting vector ID for the query.
 * @param {number} weightLimit - The maximum allowed accumulated weight.
 * @param {Object.<number, number[]>} vectorMap - The map of all available vectors.
 * @returns {number} The total accumulated value.
 */
function computeQueryValue(initialIndex, weightLimit, vectorMap) {
    let currentProcessingIndex = initialIndex;
    let accumulatedWeight = 0;
    let accumulatedValue = 0;

    while (true) {
        const currentVectorEntry = vectorMap[currentProcessingIndex];
        const vectorValue = currentVectorEntry[0];
        const vectorWeight = currentVectorEntry[1];

        accumulatedWeight += vectorWeight;

        if (accumulatedWeight <= weightLimit) {
            accumulatedValue += vectorValue;
        }

        if (currentProcessingIndex === 0) {
            break; // Stop if we've processed the root (index 0)
        }
        
        currentProcessingIndex = Math.floor(currentProcessingIndex / 2); // Equivalent to x>>=1
    }
    return accumulatedValue;
}

// --- Main execution flow ---

const rawInputLines = fileSystem.readFileSync(standardInputPath, textEncoding).split("\n");

let currentInputLinePointer = 0;

// Parse the number of vectors and then the vector data itself
const numberOfVectors = parseInt(rawInputLines[currentInputLinePointer++], RADIX_DECIMAL);
const vectorDataMap = parseVectorData(rawInputLines, numberOfVectors, currentInputLinePointer);
currentInputLinePointer += numberOfVectors; // Advance pointer past all vector data lines

// Parse the number of queries and then the query data itself
const numberOfQueries = parseInt(rawInputLines[currentInputLinePointer++], RADIX_DECIMAL);
const queryDataList = parseQueryData(rawInputLines, numberOfQueries, currentInputLinePointer);
// currentInputLinePointer += numberOfQueries; // Not strictly necessary as no further input is read

// Process each query and print the result
for (let k = 0; k < numberOfQueries; k++) {
    const currentQuery = queryDataList[k];
    const queryStartIdx = currentQuery[0];
    const queryWeightLimit = currentQuery[1];
    
    const result = computeQueryValue(queryStartIdx, queryWeightLimit, vectorDataMap);
    console.log(result);
}
