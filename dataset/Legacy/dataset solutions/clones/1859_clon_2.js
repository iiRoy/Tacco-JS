let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

/**
 * This function serves as the primary entry point for solving the graph problem.
 * It implements a Breadth-First Search (BFS) to determine if all nodes are reachable
 * from node 1 and to find the parent node for each reachable node.
 *
 * @param {object} params - An object containing various utility functions and input data.
 * @param {string} params.input - The complete raw input string.
 * @param {function(number, number, Function): (number[]|number[][])} params.load - A utility to parse structured data from the input.
 * @param {function(boolean): string} params.yesno - A utility to convert a boolean value to 'Yes' or 'No' string.
 * @param {function(number[]): number} params.math_sum - A utility to calculate the sum of an array of numbers.
 * @param {function(*): void} params.log_json - A utility to log an object as a JSON string.
 * @returns {string} 'No' if not all nodes are reachable, otherwise 'Yes' followed by the parent nodes (from node 2 onwards), each on a new line.
 */
function processGraph({ input, load, yesno, math_sum, log_json }) {
    // Load the total number of nodes (N) and edges (M) from the input.
    const [nodeCount, edgeCount] = load(2);
    // Load the edge definitions: edgeStarts[i] connects to edgeEnds[i].
    const [edgeStarts, edgeEnds] = load(edgeCount, 2);
    
    // Initialize an array to store the "parent" or "signpost" for each node.
    // pathTracker[k] will store the node from which we reached node k.
    // A value of 0 means the node has not been visited yet.
    const pathTracker = new Array(nodeCount + 1).fill(0);
    pathTracker[0] = -1; // Sentinel value for the unused 0th index.
    pathTracker[1] = -1; // Node 1 is the starting point, so it has no parent in this context.

    // Initialize a queue for the BFS traversal, starting with node 1.
    const pendingNodes = [1];
    
    // Begin the BFS traversal. The loop continues as long as there are nodes to visit.
    while (pendingNodes.length > 0) {
        // Call the loop guard to prevent infinite execution in case of problematic inputs.
        loopGuard();

        // Dequeue the next node to process.
        const currentNode = pendingNodes.shift();

        // Iterate through all defined edges to find connections from the currentNode.
        for (let idx = 0; idx < edgeCount; idx++) {
            let sourceNode = null; // The node connected to currentNode.
            let targetNode = null; // The currentNode itself, acting as a parent.

            // Check if the current edge (edgeStarts[idx], edgeEnds[idx]) involves currentNode.
            if (edgeStarts[idx] === currentNode) {
                [sourceNode, targetNode] = [edgeEnds[idx], edgeStarts[idx]];
            }
            // Check the other direction of the edge.
            if (edgeEnds[idx] === currentNode) {
                [sourceNode, targetNode] = [edgeStarts[idx], edgeEnds[idx]];
            }
            
            // If the current edge does not connect to currentNode, skip to the next edge.
            if (sourceNode === null) {
                continue;
            }

            // If the connected node (sourceNode) has not been visited yet (pathTracker[sourceNode] is 0).
            if (!pathTracker[sourceNode]) {
                pathTracker[sourceNode] = targetNode; // Mark currentNode as the parent of sourceNode.
                pendingNodes.push(sourceNode);       // Add sourceNode to the queue to be visited later.
            }
        }
    }

    // After the BFS completes, check if any node (from 2 to nodeCount) remains unvisited.
    // An unvisited node will still have a 0 in pathTracker.
    if (pathTracker.includes(0)) {
        return 'No'; // If any node is unreachable, return 'No'.
    }
    
    // If all nodes are reachable, print 'Yes' and then the parent nodes.
    console.log('Yes');
    // The result requires parent nodes starting from index 2 (node 2, node 3, ...).
    return pathTracker.slice(2).join('\n');
}


// --- Global Utilities and Execution Flow ---

// Split the raw input data into an array of tokens, using whitespace or newlines as delimiters.
let parsedTokens = rawData.split(/[\s\n]/);
let guardCounter = 0; // Counter for the loop prevention mechanism.

// Execute the main graph processing function, passing in the necessary helper functions.
let finalOutput = processGraph({
    input: rawData,
    yesno: (value) => value ? 'Yes' : 'No',
    math_sum: (numArray) => numArray.reduce((accumulator, current) => accumulator + current, 0),
    load(numRows = 1, numCols = 1, dataType = Number) {
        const totalLength = numRows * numCols;
        // Extract the required number of tokens from the parsedTokens array.
        let extractedTokens = parsedTokens.splice(0, totalLength);
        
        // Convert the extracted tokens to the specified data type if it's not String.
        if (dataType !== String) {
            extractedTokens = extractedTokens.map(dataType);
        }
        
        // If multiple columns are specified, restructure the flat array into an array of column arrays.
        if (numCols > 1) {
            const columnArrays = new Array(numCols);
            for (let colIndex = 0; colIndex < numCols; colIndex++) {
                columnArrays[colIndex] = new Array();
                for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
                    columnArrays[colIndex].push(extractedTokens[rowIndex * numCols + colIndex]);
                }
            }
            extractedTokens = columnArrays;
        }
        return extractedTokens;
    },
    log_json(valueToLog) {
        console.log(JSON.stringify(valueToLog));
    },
});

// Check the result from the main function and print it to the console.
if (finalOutput === undefined) {
    console.warn("finalOutput is undefined");
} else {
    console.log(finalOutput);
}


/**
 * A safety mechanism to prevent infinite loops during execution.
 * It increments a counter and throws an error if the counter exceeds a predefined maximum.
 * @param {number} [maxIterations=100000] - The maximum number of times this function can be called before throwing an error.
 * @throws {Error} If the iteration count exceeds `maxIterations`.
 */
function loopGuard(maxIterations = 100000) {
    guardCounter++;
    if (guardCounter >= maxIterations) {
        throw new Error("Infinite loop detected!");
    }
}

/**
 * Calculates the maximum value within an array of numbers.
 * @param {number[]} numArray - The array of numbers to search through.
 * @param {number|null} [startVal=null] - An optional initial value to compare against. If null, the first element of numArray is used.
 * @returns {number} The largest number found in the array.
 */
function calculateMax(numArray, startVal = null) {
    let currentMax = (startVal === null) ? numArray[0] : startVal;
    for (const num of numArray) {
        if (num > currentMax) {
            currentMax = num;
        }
    }
    return currentMax;
}

/**
 * Calculates the minimum value within an array of numbers.
 * @param {number[]} numArray - The array of numbers to search through.
 * @param {number|null} [startVal=null] - An optional initial value to compare against. If null, the first element of numArray is used.
 * @returns {number} The smallest number found in the array.
 */
function calculateMin(numArray, startVal = null) {
    let currentMin = (startVal === null) ? numArray[0] : startVal;
    for (const num of numArray) {
        if (num < currentMin) {
            currentMin = num;
        }
    }
    return currentMin;
}

/**
 * Performs prime factorization on a given integer.
 * @param {number} numVal - The integer to factorize.
 * @returns {object} An object where keys are prime factors and values are their corresponding powers.
 *                   For example, `getPrimeFactors(12)` would return `{ '2': 2, '3': 1 }`.
 */
function getPrimeFactors(numVal) {
    const factorsMap = {};

    // Iterate from 2 up to the square root of numVal.
    for (let factor = 2; factor * factor <= numVal; factor++) {
        if (numVal % factor === 0) {
            numVal /= factor;
            factorsMap[factor] = 1; // First occurrence of this prime factor.
            
            // Continue dividing by the same factor until it's no longer divisible.
            while (numVal % factor === 0) {
                numVal /= factor;
                factorsMap[factor]++;
            }
        }
    }

    // If numVal is still greater than 1 after the loop, it means the remaining numVal is a prime factor itself.
    if (numVal > 1) {
        factorsMap[numVal] = 1;
    }

    return factorsMap;
}
