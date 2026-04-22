"use strict";

// --- Input Stream Management Utilities ---

// Reads the entire standard input as a UTF-8 string.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
// Splits the input string into an array of tokens using any sequence of whitespace.
// `.filter(Boolean)` removes any empty strings that might result from multiple delimiters.
const inputTokens = rawInputData.split(/\s+/).filter(Boolean);
// Pointer to the current token being processed.
let currentTokenIndex = 0;

/**
 * Extracts and returns the next token from the input stream as an integer.
 * Advances the token pointer.
 * @returns {number} The parsed integer.
 */
function readInteger() {
    return Number(inputTokens[currentTokenIndex++]);
}

/**
 * Extracts and returns the next token from the input stream as a string.
 * Advances the token pointer.
 * @returns {string} The raw string token.
 */
function readNextString() {
    return inputTokens[currentTokenIndex++];
}

/**
 * Extracts and returns the next token from the input stream as a BigInt.
 * Advances the token pointer.
 * @returns {BigInt} The parsed BigInt.
 */
function readBigInteger() {
    return BigInt(inputTokens[currentTokenIndex++]);
}

/**
 * Reads a specified number of tokens from the input stream and converts them
 * into an array of numbers.
 * @param {number} count - The number of tokens to read.
 * @returns {number[]} An array containing the parsed numbers.
 */
function readNumberArray(count) {
    const startIndex = currentTokenIndex;
    currentTokenIndex += count;
    // Maps each token to a Number type.
    return inputTokens.slice(startIndex, currentTokenIndex).map(Number);
}

/**
 * Reads a 2D matrix (array of arrays) of numbers from the input stream.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @returns {number[][]} The parsed 2D array (matrix).
 */
function readNumberMatrix(height, width) {
    const matrix = [];
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        matrix.push(readNumberArray(width)); // Reuses readNumberArray for each row.
    }
    return matrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value or
 * by calling a factory function for each element. This function is a safe and
 * explicit alternative to using `eval` for array creation.
 * @param {any|function(): any} initialValueOrFactory - The value to fill array elements with,
 *   or a function to call to generate the initial value for each element.
 * @param {...number} dimensions - A list of numbers specifying the size of each dimension.
 * @returns {Array<any>} The newly created multi-dimensional array.
 */
function createDynamicArray(initialValueOrFactory, ...dimensions) {
    if (dimensions.length === 0) {
        // Base case: if no more dimensions, return the value or result of factory.
        return typeof initialValueOrFactory === 'function' ? initialValueOrFactory() : initialValueOrFactory;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    // Create an array for the current dimension, recursively filling its elements.
    return Array.from({ length: currentDimensionSize }, () =>
        createDynamicArray(initialValueOrFactory, ...remainingDimensions)
    );
}

// --- Main Program Execution Flow ---

// Call the primary problem-solving function and store its output.
const finalOutputString = solveProblem();

// If the function returns a non-undefined value, print it to the console.
if (finalOutputString !== undefined) {
    console.log(String(finalOutputString));
}

// --- Core Problem Solving Logic ---

/**
 * Implements the main algorithm to solve the problem.
 * This function handles input parsing, DP state management, tree traversal,
 * and query processing.
 * @returns {string} The newline-separated string of query results.
 */
function solveProblem() {
    // Defines a constant for the maximum depth for DP table allocation or tree traversal strategy.
    const maxTreeDepth = 10;

    // Read the total number of nodes/items in the implicit binary tree structure.
    const totalNodes = readInteger();

    // Basic validation: if no nodes, there's nothing to process.
    if (totalNodes <= 0) {
        return "";
    }

    // Read the value and weight for each node.
    // `nodeItemPairs[i]` will contain `[value_i, weight_i]`.
    const nodeItemPairs = readNumberMatrix(totalNodes, 2);

    // Read the total number of queries to be processed.
    const totalQueries = readInteger();

    // `nodeQueryRequirements`: An array where each index corresponds to a tree node.
    // `nodeQueryRequirements[nodeId]` stores `[maxCapacityNeeded, queryId1, capacity1, queryId2, capacity2, ...]`.
    // `maxCapacityNeeded` is the maximum `L` (capacity) required by any query in the subtree rooted at `nodeId`,
    // including queries directly at `nodeId`. This helps in sizing DP tables efficiently.
    const nodeQueryRequirements = createDynamicArray(() => [0], totalNodes);

    // Process each query: store it at its respective node and propagate the
    // maximum required capacity upwards towards the root.
    for (let queryIndex = 0; queryIndex < totalQueries; queryIndex++) {
        let targetNodeId = readInteger() - 1; // Convert to 0-based index.
        const requestedCapacity = readInteger();

        // Store the query's original ID and its requested capacity at the target node.
        nodeQueryRequirements[targetNodeId].push(queryIndex, requestedCapacity);

        // Update the `maxCapacityNeeded` for the current node if the current query's capacity is higher.
        if (nodeQueryRequirements[targetNodeId][0] < requestedCapacity) {
            nodeQueryRequirements[targetNodeId][0] = requestedCapacity;
        }

        // Propagate this `maxCapacityNeeded` up the tree.
        // This ensures that all ancestor nodes have DP tables large enough to cover
        // the maximum capacity required by any query in their respective subtrees.
        let propagationNode = targetNodeId;
        while (propagationNode > 0) { // Continue until the root node (index 0) is reached.
            propagationNode = (propagationNode - 1) >> 1; // Calculate parent node index.
            // Optimization: if the parent already requires a capacity greater than or equal
            // to the current query's capacity, no further propagation up this path is needed.
            if (nodeQueryRequirements[propagationNode][0] >= requestedCapacity) {
                break;
            }
            // Update the parent node's `maxCapacityNeeded`.
            nodeQueryRequirements[propagationNode][0] = requestedCapacity;
        }
    }

    // Initialize DP for the root node (node 0).
    const rootItemValue = nodeItemPairs[0][0];
    const rootItemWeight = nodeItemPairs[0][1];
    // `maxRequiredCapacity` for DP table sizing: `max L` + 1 (since capacities go from 0 to L).
    const rootMaxCapacity = nodeQueryRequirements[0][0] + 1;

    // `knapsackDPTable[depth][capacity]` stores the maximum value achievable
    // with items encountered up to `depth` with a total weight up to `capacity`.
    const knapsackDPTable = new Array(maxTreeDepth);

    // Initialize the DP table for depth 0 (the root node).
    knapsackDPTable[0] = Array(rootMaxCapacity).fill(0);
    // If the root item's weight is within capacity, initialize DP values accordingly.
    for (let capacity = rootItemWeight; capacity < rootMaxCapacity; capacity++) {
        knapsackDPTable[0][capacity] = rootItemValue;
    }

    // `queryResults`: An array to store the final answer for each query, indexed by query ID.
    const queryResults = createDynamicArray(0, totalQueries);

    // Process queries directly associated with the root node using its initial DP table.
    processNodeQueries(0, 0);

    // `traversalQueue`: Used for a breadth-first-like traversal of the implicit binary tree.
    // Each entry is `[nodeId, depthFlag]`.
    // `depthFlag`: Positive value indicates the actual depth and signals to copy the parent's DP table.
    // Negative value indicates the actual depth and signals to reuse the parent's DP table (space optimization for right children).
    const traversalQueue = [];

    // Initialize the queue with children of the root node (if they exist).
    // Pushing right child first ensures left child is processed first due to stack-like `pop` behavior.
    const rootLeftChildId = (0 << 1) + 1; // Equivalent to 2 * 0 + 1 = 1
    const rootRightChildId = (0 << 1) + 2; // Equivalent to 2 * 0 + 2 = 2

    if (totalNodes > rootLeftChildId) { // Check if a left child exists.
        if (totalNodes > rootRightChildId) { // Check if a right child exists.
            // Right child: needs a copy of DP from parent (depth 0).
            traversalQueue.push(rootRightChildId, 1); // Depth 1, positive flag for copy.
        }
        // Left child: can reuse DP from parent (depth 0).
        traversalQueue.push(rootLeftChildId, -1); // Depth 1, negative flag for reuse.
    }


    // Main loop for tree traversal and DP computation.
    while (traversalQueue.length > 0) {
        const currentDepthFlag = traversalQueue.pop(); // Pop depth flag.
        const currentNodeId = traversalQueue.pop();   // Pop node ID.

        // `actualDepth` is the absolute depth. `shouldCopyDP` indicates if a new DP array is needed.
        const actualDepth = Math.abs(currentDepthFlag);
        const shouldCopyDP = currentDepthFlag > 0;

        // Determine the maximum capacity needed for the DP table at this node's depth.
        const maxRequiredCapacity = nodeQueryRequirements[currentNodeId][0] + 1;

        // Optimization: If no queries require capacity > 0 for this node or its subtree, skip.
        if (maxRequiredCapacity <= 1) {
            continue;
        }

        // Get the value and weight for the current node.
        const itemValue = nodeItemPairs[currentNodeId][0];
        const itemWeight = nodeItemPairs[currentNodeId][1];

        // Prepare the DP table for the current `actualDepth`.
        if (shouldCopyDP) {
            // For left children, or if explicitly requested (positive flag), create a new DP array
            // by copying a slice of the parent's DP table. This ensures the parent's state is preserved.
            knapsackDPTable[actualDepth] = knapsackDPTable[actualDepth - 1].slice(0, maxRequiredCapacity);
        } else {
            // For right children (negative flag), reuse the parent's DP table directly.
            // This is a space optimization, assuming the parent's DP table (knapsackDPTable[actualDepth - 1])
            // is no longer needed in its original state after its left child and parent are fully processed.
            knapsackDPTable[actualDepth] = knapsackDPTable[actualDepth - 1];
        }

        // Apply the current node's item (value, weight) to the DP table.
        // This is a 0/1 knapsack-like update. Iterate downwards to ensure each item is considered once.
        for (let capacity = maxRequiredCapacity - 1; capacity >= itemWeight; capacity--) {
            // Update the DP table: choose between not including the current item
            // (value is `knapsackDPTable[actualDepth][capacity]`) or including it
            // (value is `knapsackDPTable[actualDepth][capacity - itemWeight] + itemValue`).
            knapsackDPTable[actualDepth][capacity] = Math.max(
                knapsackDPTable[actualDepth][capacity],
                knapsackDPTable[actualDepth][capacity - itemWeight] + itemValue
            );
        }

        // After updating the DP table for `currentNodeId`, process any queries directly linked to it.
        processNodeQueries(currentNodeId, actualDepth);

        // Calculate the indices of the left and right children.
        const leftChildId = (currentNodeId << 1) + 1;
        const rightChildId = (currentNodeId << 1) + 2;

        // Special handling for nodes at the `maxTreeDepth - 1` (last level for full DP tables).
        // This block likely implements a different strategy for deeper parts of the tree,
        // possibly to avoid excessive DP table copies or to aggregate items more efficiently.
        if (actualDepth === maxTreeDepth - 1) {
            // `deepTraversalStack` is used for a depth-first-like traversal within this deep segment.
            const deepTraversalStack = [];
            // `accumulatedItems` stores `[value, weight]` pairs that represent combinations
            // of items encountered along the path from the node at `maxTreeDepth - 1`.
            const accumulatedItems = [];

            // Initialize `deepTraversalStack` with children of `currentNodeId`.
            if (totalNodes > leftChildId) { // Check if left child exists.
                if (totalNodes > rightChildId) { // Check if right child exists.
                    // Push right child first; its `accumulatedItems` will be reset to current length.
                    deepTraversalStack.push(rightChildId, accumulatedItems.length);
                }
                // Push left child; its `accumulatedItems` will be reset to empty (-1 flag).
                deepTraversalStack.push(leftChildId, -1);
            }

            // Traverse the deep segments of the tree.
            while (deepTraversalStack.length > 0) {
                const tempListResetPoint = deepTraversalStack.pop(); // Pop reset point for `accumulatedItems`.
                let subNodeId = deepTraversalStack.pop();           // Pop current sub-node ID.

                // If `tempListResetPoint` is non-negative, truncate `accumulatedItems` to that length.
                // This effectively "resets" the list to its state before processing a sibling branch.
                if (tempListResetPoint >= 0) {
                    accumulatedItems.length = tempListResetPoint;
                }

                // Get `maxCapacityNeeded` for the current sub-node.
                const subNodeMaxCapacity = nodeQueryRequirements[subNodeId][0] + 1;

                // If no queries for this sub-node, skip its processing, but still push its children.
                if (subNodeMaxCapacity <= 1) {
                     const subNodeLeftChild = (subNodeId << 1) + 1;
                    if (totalNodes > subNodeLeftChild) {
                        const subNodeRightChild = (subNodeId << 1) + 2;
                        if (totalNodes > subNodeRightChild) {
                            deepTraversalStack.push(subNodeRightChild, accumulatedItems.length);
                        }
                        deepTraversalStack.push(subNodeLeftChild, -1);
                    }
                    continue;
                }

                // Get item value and weight for the current sub-node.
                const currentSubItemValue = nodeItemPairs[subNodeId][0];
                const currentSubItemWeight = nodeItemPairs[subNodeId][1];

                // Store the current size of `accumulatedItems` before adding new combinations.
                const initialAccumulatedItemsCount = accumulatedItems.length;

                // Add the current sub-node's item itself to the `accumulatedItems` list, if its weight allows.
                if (currentSubItemWeight < subNodeMaxCapacity) {
                    accumulatedItems.push(currentSubItemValue, currentSubItemWeight);
                }

                // Combine the current sub-node's item with all previously `accumulatedItems`.
                // This generates new `[value, weight]` pairs representing paths through the deep segment.
                for (let accIdx = 0; accIdx < initialAccumulatedItemsCount; accIdx += 2) {
                    const prevAccValue = accumulatedItems[accIdx];
                    const prevAccWeight = accumulatedItems[accIdx + 1];

                    // If combining items does not exceed the `subNodeMaxCapacity`, add the new pair.
                    if (prevAccWeight + currentSubItemWeight < subNodeMaxCapacity) {
                        accumulatedItems.push(prevAccValue + currentSubItemValue, prevAccWeight + currentSubItemWeight);
                    }
                }

                // Process queries for the current sub-node using the `knapsackDPTable` from `actualDepth`
                // and the `accumulatedItems` list.
                const subNodeQueryList = nodeQueryRequirements[subNodeId];
                for (let queryDataIdx = 1; queryDataIdx < subNodeQueryList.length; queryDataIdx += 2) {
                    const specificQueryId = subNodeQueryList[queryDataIdx];
                    const specificQueryCapacity = subNodeQueryList[queryDataIdx + 1];

                    // The base answer for this query comes directly from the DP table
                    // at the `actualDepth` (which is `maxTreeDepth - 1`).
                    // This covers items from the root up to the `maxTreeDepth - 1` node.
                    queryResults[specificQueryId] = Math.max(queryResults[specificQueryId], knapsackDPTable[actualDepth][specificQueryCapacity]);

                    // Now, iterate through all `accumulatedItems` (representing items from the deep path).
                    // Combine their values with values from the DP table for the remaining capacity.
                    for (let itemPairIdx = 0; itemPairIdx < accumulatedItems.length; itemPairIdx += 2) {
                        const accumulatedItemValue = accumulatedItems[itemPairIdx];
                        const accumulatedItemWeight = accumulatedItems[itemPairIdx + 1];

                        // If the query's capacity is sufficient to include the accumulated item weight,
                        // check the DP table for the remaining capacity.
                        if (specificQueryCapacity >= accumulatedItemWeight) {
                            const remainingCapacity = specificQueryCapacity - accumulatedItemWeight;
                            queryResults[specificQueryId] = Math.max(
                                queryResults[specificQueryId],
                                knapsackDPTable[actualDepth][remainingCapacity] + accumulatedItemValue
                            );
                        }
                    }
                }

                // Add children of the current sub-node to the `deepTraversalStack`.
                const nextSubNodeLeftChild = (subNodeId << 1) + 1;
                if (totalNodes > nextSubNodeLeftChild) {
                    const nextSubNodeRightChild = (subNodeId << 1) + 2;
                    if (totalNodes > nextSubNodeRightChild) {
                        deepTraversalStack.push(nextSubNodeRightChild, accumulatedItems.length);
                    }
                    deepTraversalStack.push(nextSubNodeLeftChild, -1);
                }
            } // End of deepTraversalStack while loop.
        } else {
            // If not at `maxTreeDepth - 1`, continue with normal tree traversal.
            const nextDepth = actualDepth + 1;

            // Add children of `currentNodeId` to the main `traversalQueue`.
            const leftChildId = (currentNodeId << 1) + 1;
            const rightChildId = (currentNodeId << 1) + 2;

            if (totalNodes > leftChildId) { // Check if left child exists.
                if (totalNodes > rightChildId) { // Check if right child exists.
                    // Right child: needs a new DP table copy (positive depth flag).
                    traversalQueue.push(rightChildId, nextDepth);
                }
                // Left child: can reuse parent's DP table (negative depth flag).
                traversalQueue.push(leftChildId, -nextDepth);
            }
        }
    } // End of traversalQueue while loop.

    // Join all query results with newline characters to form the final output string.
    return queryResults.join("\n");

    /**
     * Helper function to process all queries directly associated with a given node.
     * It uses the pre-computed DP table at the specified depth to find the answers.
     * @param {number} nodeId - The index of the node whose queries are to be processed.
     * @param {number} depth - The current depth in the `knapsackDPTable` to use.
     */
    function processNodeQueries(nodeId, depth) {
        const currentNodeQueryList = nodeQueryRequirements[nodeId];
        // Iterate through the query data for this node, starting from index 1
        // to skip the `maxCapacityNeeded` value at index 0.
        for (let queryDataIdx = 1; queryDataIdx < currentNodeQueryList.length; queryDataIdx += 2) {
            const specificQueryId = currentNodeQueryList[queryDataIdx];
            const specificQueryCapacity = currentNodeQueryList[queryDataIdx + 1];
            // The answer for this query is directly found in the DP table at the specified capacity.
            // It's the maximum value achievable with items up to this node, given the capacity.
            queryResults[specificQueryId] = knapsackDPTable[depth][specificQueryCapacity];
        }
    }
}