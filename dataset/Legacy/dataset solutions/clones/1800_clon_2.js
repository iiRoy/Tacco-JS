"use strict";

// Core module for file system operations
var srcData = require("fs").readFileSync("/dev/stdin", "utf8");

// Tokenize the input string by spaces or newlines
var tokenStream = srcData.split(/ |\n/),
    tokenIndex = 0x0; // Pointer for current token position

/**
 * Retrieves and converts the next token in the stream to a number.
 * @returns {number} The numeric value of the next token.
 */
function getNextNum() {
    return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token in the stream as a string.
 * @returns {string} The string value of the next token.
 */
function getNextStr() {
    return tokenStream[tokenIndex++];
}

/**
 * Retrieves and converts the next token in the stream to a BigInt.
 * @returns {BigInt} The BigInt value of the next token.
 */
function getNextBigInt() {
    return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Retrieves a specified number of tokens from the stream.
 * Optionally converts them to numbers.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} mapToNum - If true, tokens are converted to numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens.
 */
function getNNums(count, mapToNum) {
    // If mapToNum is truthy, convert elements to numbers; otherwise, keep as strings.
    return mapToNum ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

/**
 * Retrieves a 2D matrix of tokens from the stream.
 * Optionally converts elements to numbers.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} mapToNum - If true, elements are converted to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function getMatrix(height, width, mapToNum) {
    var resultMatrix = [],
        rowIter = 0x0;
    // Populate the matrix row by row.
    if (mapToNum) {
        for (; rowIter < height; rowIter++) resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    } else {
        for (; rowIter < height; rowIter++) resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
    }
    return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * This function uses `eval` for its dynamic array creation.
 * @param {*} initialValue - The value to fill the array elements with.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var args = arguments,
        argCount = args.length,
        evalString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argCount) evalString = "Array(args[" + argCount + "]).fill().map(x=>" + evalString + ")";
    return eval(evalString);
}

// Execute the primary program logic and store its return value.
var programOutput = executeProgram();

// If the program produced output, print it to the console.
if (programOutput !== undefined) console.log(String(programOutput));

/**
 * The main function encapsulating the problem's solution logic.
 * @returns {string} The final computed results, joined by newlines.
 */
function executeProgram() {
    // A constant representing a maximum depth or a specific array dimension.
    const maxDepthConst = 0xA; // Original 'aa'

    // Read the total number of nodes from input.
    var nodeCount = getNextNum(); // Original 'n'

    // Calculate a minimum node count, though this variable is not subsequently used.
    var minNodeCount = Math.min(nodeCount, 0x1 << maxDepthConst); // Original 'mn'

    // Read the value and weight pairs for each node.
    var nodeValues = getMatrix(nodeCount, 0x2); // Original 'V'

    // Read the total number of queries.
    var queryCount = getNextNum(); // Original 'q'

    // Initialize an array to track required levels for each node.
    // Each element is an array: [max_level_needed, query_id_1, level_1, query_id_2, level_2, ...].
    var requiredLevels = createMultiDimArray("[0x0]", nodeCount); // Original 'need'

    // Process each query to determine the maximum required level for nodes.
    for (var idx = 0x0; idx < queryCount; idx++) { // Original 'i'
        var currentNodeIdx = getNextNum() - 0x1, // Original 'u', adjust to 0-indexed.
            currentLevel = getNextNum(); // Original 'l'

        // Store the query's ID and level for the current node.
        requiredLevels[currentNodeIdx].push(idx, currentLevel);

        // Update the maximum level required for this specific node.
        if (requiredLevels[currentNodeIdx][0x0] < currentLevel) requiredLevels[currentNodeIdx][0x0] = currentLevel;

        // Propagate the maximum required level upwards through the binary tree structure.
        while (currentNodeIdx) {
            currentNodeIdx = (currentNodeIdx - 0x1) >> 0x1; // Move to the parent node.
            // If the parent already requires a level equal to or greater than current, stop propagation.
            if (requiredLevels[currentNodeIdx][0x0] >= currentLevel) break;
            requiredLevels[currentNodeIdx][0x0] = currentLevel; // Update parent's max level.
        }
    }

    // Initialize variables for the root node's DP calculation.
    var currentVal = nodeValues[0x0][0x0], // Original 'v'
        currentWeight = nodeValues[0x0][0x1], // Original 'w'
        maxLevelForDP = requiredLevels[0x0][0x0] + 0x1; // Original 'mx'

    // Dynamic programming table: dynamicProgTable[depth][weight] stores the maximum value.
    var dynamicProgTable = Array(maxDepthConst); // Original 'dp'
    // Initialize the DP table for depth 0 (root node).
    // Fill with 0 up to currentWeight, then with currentVal from currentWeight onwards.
    dynamicProgTable[0x0] = Array(maxLevelForDP).fill(0x0, 0x0, currentWeight).fill(currentVal, currentWeight);

    // Array to store the final answers for all queries.
    var resultArray = createMultiDimArray(0x0, queryCount); // Original 'ans'

    // Process queries specifically for the root node.
    processNodeQueries(0x0, 0x0); // Original 'solve(0,0)'

    // Initialize a queue for a breadth-first-like traversal and processing.
    var processingQueue = []; // Original 'qq'
    // Populate the queue based on the number of nodes.
    if (nodeCount > 0x2) processingQueue = [0x1, -0x1, 0x2, 0x1]; // For nodes 1 and 2, with depth 1.
    else if (nodeCount === 0x2) processingQueue = [0x1, -0x1]; // Only node 1, with depth 1.

    // Main loop to process nodes from the queue.
    while (processingQueue.length) {
        var currentDepth = processingQueue.pop(), // Original 'd'
            currentNodeIdx = processingQueue.pop(), // Original 'u'
            maxLevelForDP = requiredLevels[currentNodeIdx][0x0] + 0x1; // Original 'mx'

        // If the maximum required level for this node is 1, no further DP is needed for it or its children.
        if (maxLevelForDP === 0x1) continue;

        currentVal = nodeValues[currentNodeIdx][0x0];
        currentWeight = nodeValues[currentNodeIdx][0x1];

        // Handle DP table inheritance or copying based on currentDepth.
        if (currentDepth < 0x0) { // Negative depth indicates returning from a child, so reuse parent's DP table.
            currentDepth = -currentDepth;
            dynamicProgTable[currentDepth] = dynamicProgTable[currentDepth - 0x1];
        } else { // Positive depth means processing a new child, copy and potentially truncate parent's DP table.
            dynamicProgTable[currentDepth] = dynamicProgTable[currentDepth - 0x1].slice(0x0, maxLevelForDP);
        }

        // Apply knapsack-like DP logic for the current node's item.
        for (var idx = maxLevelForDP - 0x1; currentWeight <= idx; idx--) {
            if (dynamicProgTable[currentDepth][idx] < dynamicProgTable[currentDepth][idx - currentWeight] + currentVal) {
                dynamicProgTable[currentDepth][idx] = dynamicProgTable[currentDepth][idx - currentWeight] + currentVal;
            }
        }

        // Solve queries for the current node using its updated DP table.
        processNodeQueries(currentNodeIdx, currentDepth);

        // Prepare to process children: move to the left child.
        currentNodeIdx = currentNodeIdx + currentNodeIdx + 0x1;

        // If the left child index is out of bounds, skip to the next item in the queue.
        if (nodeCount <= currentNodeIdx) continue;

        // Special handling for nodes at a specific depth (maxDepthConst - 1).
        if (currentDepth === maxDepthConst - 0x1) {
            // This block uses a different queueing and processing strategy for deeper nodes.
            var parentIdx = currentNodeIdx >> 0x1; // Original 'p', parent index.
            var subQueue = [], // Original 'qz', a temporary queue for this specific branch.
                tempItems = []; // Original 't', temporary storage for item combinations.

            // Initialize subQueue based on the existence of the right child.
            if (currentNodeIdx + 0x1 === nodeCount) subQueue = [currentNodeIdx, -0x1]; // Only left child.
            else subQueue = [currentNodeIdx, 0x0, currentNodeIdx + 0x1, -0x1]; // Both children.

            // Process children using the subQueue.
            while (subQueue.length) {
                var queueItem = subQueue.pop(), // Original 'z', indicates branch point or reset.
                    childNodeIdx = subQueue.pop(), // Original 'u', the current child node index.
                    childMaxLevel = requiredLevels[childNodeIdx][0x0] + 0x1; // Original 'mx'.

                if (childMaxLevel === 0x1) continue; // If no queries for this child, skip.

                // Reset tempItems length if queueItem indicates a new branch.
                if (queueItem >= 0x0) tempItems.length = queueItem;
                var tempItemsLength = tempItems.length; // Original 'ln'.

                currentVal = nodeValues[childNodeIdx][0x0];
                currentWeight = nodeValues[childNodeIdx][0x1];

                // Add the current child's item to tempItems if its weight is within bounds.
                if (currentWeight <= childMaxLevel) tempItems.push(currentVal, currentWeight);

                // Combine current child's item with existing items in tempItems.
                for (var itemIter = 0x0; itemIter < tempItemsLength; itemIter += 0x2) { // Original 'i'.
                    if (tempItems[itemIter + 0x1] + currentWeight <= childMaxLevel) {
                        tempItems.push(tempItems[itemIter] + currentVal, tempItems[itemIter + 0x1] + currentWeight);
                    }
                }

                // Process queries for the current child using combined items and the parent's DP table.
                for (var queryIter = 0x1; queryIter < requiredLevels[childNodeIdx].length; queryIter += 0x2) { // Original 'i'.
                    var queryId = requiredLevels[childNodeIdx][queryIter], // Original 'id'.
                        queryLevel = requiredLevels[childNodeIdx][queryIter + 0x1]; // Original 'll'.

                    for (var itemPairIter = 0x0; itemPairIter < tempItems.length; itemPairIter += 0x2) { // Original 'k'.
                        var itemValue = tempItems[itemPairIter], // Original 'vv'.
                            itemWeight = tempItems[itemPairIter + 0x1]; // Original 'ww'.

                        if (queryLevel < itemWeight) continue; // If required level is less than item weight, skip.
                        if (resultArray[queryId] < dynamicProgTable[currentDepth][queryLevel - itemWeight] + itemValue) {
                            resultArray[queryId] = dynamicProgTable[currentDepth][queryLevel - itemWeight] + itemValue;
                        }
                    }
                }

                // Move to the left child of the current child for further processing.
                childNodeIdx = childNodeIdx + childNodeIdx + 0x1;

                // If the child's child is out of bounds, continue.
                if (nodeCount <= childNodeIdx) continue;

                // Add children to subQueue for further processing.
                if (childNodeIdx + 0x1 === nodeCount) subQueue.push(childNodeIdx, -0x1); // Only left child.
                else subQueue.push(childNodeIdx, tempItems.length, childNodeIdx + 0x1, -0x1); // Both children.
            }
        } else {
            // For depths less than maxDepthConst - 1, use the regular processingQueue.
            currentDepth++; // Increment depth for children.
            if (currentNodeIdx + 0x1 === nodeCount) processingQueue.push(currentNodeIdx, -currentDepth); // Only left child.
            else processingQueue.push(currentNodeIdx, -currentDepth, currentNodeIdx + 0x1, currentDepth); // Both children.
        }
    }

    // Join the final results with newline characters and return the string.
    return resultArray.join("\n");

    /**
     * Helper function to solve queries associated with a specific node.
     * It uses the current state of the DP table.
     * @param {number} nodeIndex - The index of the node being processed.
     * @param {number} dpDepth - The current depth level corresponding to the DP table.
     */
    function processNodeQueries(nodeIndex, dpDepth) { // Original 'solve(k,d)'
        var nodeRequirements = requiredLevels[nodeIndex]; // Original 'a'
        // Iterate through the stored queries for this node.
        for (var queryIterator = 0x1; queryIterator < nodeRequirements.length; queryIterator += 0x2) { // Original 'i'
            resultArray[nodeRequirements[queryIterator]] = dynamicProgTable[dpDepth][nodeRequirements[queryIterator + 0x1]];
        }
    }
}
