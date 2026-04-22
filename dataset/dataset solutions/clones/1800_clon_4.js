const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

class InputTokenizer {
    #dataFragments;
    #fragmentPointer;

    constructor(rawContent) {
        this.#dataFragments = rawContent.split(/ |\n/).filter(token => token !== '');
        this.#fragmentPointer = 0;
    }

    fetchNextNumber() {
        return Number(this.#dataFragments[this.#fragmentPointer++]);
    }

    fetchNextString() {
        return this.#dataFragments[this.#fragmentPointer++];
    }

    fetchNextBigInt() {
        return BigInt(this.#dataFragments[this.#fragmentPointer++]);
    }

    fetchNumberSequence(count) {
        const sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(this.fetchNextNumber());
        }
        return sequence;
    }

    fetchNumberGrid(numRows, numCols) {
        const grid = [];
        for (let i = 0; i < numRows; i++) {
            grid.push(this.fetchNumberSequence(numCols));
        }
        return grid;
    }
}

const inputProcessor = new InputTokenizer(standardInputContent);

// --- Global Constants and Data Structures ---
const DEEP_TRAVERSAL_THRESHOLD_DEPTH = 10; // Corresponds to original 'aa'

let totalNodeCount; // Corresponds to original 'n'
let nodeAttributesCollection; // Corresponds to original 'V'
let queryMap = new Map(); // Corresponds to original 'need'
let finalOutputRecords; // Corresponds to original 'ans'

class ItemAttributes {
    constructor(value, weight) {
        this.value = value;
        this.weight = weight;
    }
}

class QueryDetails {
    constructor() {
        this.maximumCapacityRequired = 0;
        this.individualQueryList = []; // Array of { queryId: number, capacityLimit: number }
    }

    addQuery(queryId, capacityLimit) {
        this.individualQueryList.push({ queryId, capacityLimit });
        if (capacityLimit > this.maximumCapacityRequired) {
            this.maximumCapacityRequired = capacityLimit;
        }
    }
}

// --- Helper Functions ---

// Recursively determines the maximum capacity required by any query in a subtree.
// This populates the `maximumCapacityRequired` property in `queryMap`.
function computeSubtreeCapacityNeeds(nodeIndex) {
    if (nodeIndex >= totalNodeCount) return 0;

    let currentMaxCap = 0;
    if (queryMap.has(nodeIndex)) {
        currentMaxCap = queryMap.get(nodeIndex).maximumCapacityRequired;
    }

    const leftChildIdx = 2 * nodeIndex + 1;
    const rightChildIdx = 2 * nodeIndex + 2;

    if (leftChildIdx < totalNodeCount) {
        currentMaxCap = Math.max(currentMaxCap, computeSubtreeCapacityNeeds(leftChildIdx));
    }
    if (rightChildIdx < totalNodeCount) {
        currentMaxCap = Math.max(currentMaxCap, computeSubtreeCapacityNeeds(rightChildIdx));
    }

    // Store the computed max capacity for the current node's subtree
    if (!queryMap.has(nodeIndex)) {
        queryMap.set(nodeIndex, new QueryDetails());
    }
    queryMap.get(nodeIndex).maximumCapacityRequired = currentMaxCap;
    return currentMaxCap;
}


// --- Main Recursive Tree Solver ---
// `nodeIndex`: Current node in the implicit binary tree (0-indexed).
// `currentDepth`: Depth of the current node (root is 0).
// `ancestorKnapsackState`: DP array representing max values for capacities, accumulated from ancestors.
function solveTreePath(nodeIndex, currentDepth, ancestorKnapsackState) {
    if (nodeIndex >= totalNodeCount) return;

    const currentItem = nodeAttributesCollection[nodeIndex];
    const currentNodeQueryInfo = queryMap.get(nodeIndex);
    
    // `effectiveStateSize` is `mx` from the original. It's the max capacity needed + 1.
    const effectiveStateSize = (currentNodeQueryInfo ? currentNodeQueryInfo.maximumCapacityRequired : 0) + 1;

    // Create a new knapsack state for the current path, copying from ancestor's state.
    // This is analogous to `dp[d] = dp[d-1]` or `dp[d] = dp[d-1].slice(0,mx)`.
    let currentPathKnapsackState = Array(effectiveStateSize).fill(0);
    // Copy values from `ancestorKnapsackState` up to its length or `effectiveStateSize`.
    for (let i = 0; i < Math.min(ancestorKnapsackState.length, effectiveStateSize); i++) {
        currentPathKnapsackState[i] = ancestorKnapsackState[i];
    }
    
    // Apply the current item (nodeAttributesCollection[nodeIndex]) to the knapsack state.
    // This is the 0/1 knapsack update loop.
    for (let capacityIterator = effectiveStateSize - 1; capacityIterator >= currentItem.weight; capacityIterator--) {
        const previousCapacityValue = currentPathKnapsackState[capacityIterator - currentItem.weight];
        if (previousCapacityValue !== undefined) {
            const potentialNewValue = previousCapacityValue + currentItem.value;
            if (currentPathKnapsackState[capacityIterator] < potentialNewValue) {
                currentPathKnapsackState[capacityIterator] = potentialNewValue;
            }
        }
    }

    // Check if we reached the deep traversal threshold depth.
    if (currentDepth === DEEP_TRAVERSAL_THRESHOLD_DEPTH - 1) {
        // At this depth, `currentPathKnapsackState` is `dp[d]` (from original).
        // We switch to a specialized recursive solver for the block starting from this node.
        // It will use `currentPathKnapsackState` as its base DP for query resolution.
        // `ancestorPathCombinations` starts with [{cost:0, value:0}] for the path below this threshold.
        processDeepSubtreeBlock(nodeIndex, currentPathKnapsackState, [{ cost: 0, value: 0 }]);
    } else {
        // For shallower depths, resolve queries directly associated with this node.
        // This is analogous to `solve(k, d)` from the original.
        if (currentNodeQueryInfo) {
            for (const query of currentNodeQueryInfo.individualQueryList) {
                if (query.capacityLimit < currentPathKnapsackState.length) {
                    finalOutputRecords[query.queryId] = currentPathKnapsackState[query.capacityLimit];
                } else {
                    finalOutputRecords[query.queryId] = 0; // Capacity too high for current DP state
                }
            }
        }
        // Continue normal recursive calls for children.
        solveTreePath(2 * nodeIndex + 1, currentDepth + 1, currentPathKnapsackState);
        solveTreePath(2 * nodeIndex + 2, currentDepth + 1, currentPathKnapsackState);
    }
}

// --- Specialized Recursive Solver for Deep Subtree Blocks ---
// This function mimics the `while(qz.length)` loop and `t` array logic from the original.
// `currentNodeIdx`: The node currently being processed in the deep block.
// `baseKnapsackStateForBlock`: The DP array inherited from the parent at `DEEP_TRAVERSAL_THRESHOLD_DEPTH - 1`.
// `ancestorPathCombinations`: List of {cost, value} pairs accumulated along the path from the block root to `currentNodeIdx`'s parent.
function processDeepSubtreeBlock(currentNodeIdx, baseKnapsackStateForBlock, ancestorPathCombinations) {
    if (currentNodeIdx >= totalNodeCount) return;

    const { value: itemValue, weight: itemWeight } = nodeAttributesCollection[currentNodeIdx];
    const currentNodeQueryInfo = queryMap.get(currentNodeIdx);

    // `mx` in the original is `need[u][0]+1` for the current node `u`.
    const currentBlockMaxCapacity = (currentNodeQueryInfo ? currentNodeQueryInfo.maximumCapacityRequired : 0) + 1; 

    // `currentPathCombinations` represents the `t` array for the path *including* `currentNodeIdx`.
    let currentPathCombinations = Array.from(ancestorPathCombinations); // Copy parent's combinations

    // Generate new combinations by adding the current item to all parent combinations.
    const newCombinationsWithCurrentItem = [];
    for (const parentCombo of ancestorPathCombinations) {
        const newCost = parentCombo.cost + itemWeight;
        const newValue = parentCombo.value + itemValue;
        if (newCost < currentBlockMaxCapacity) { // Prune if cost exceeds current node's max capacity constraint
            newCombinationsWithCurrentItem.push({ cost: newCost, value: newValue });
        }
    }
    currentPathCombinations.push(...newCombinationsWithCurrentItem);

    // Optimize `currentPathCombinations`: keep only the best value for each cost.
    currentPathCombinations.sort((a, b) => a.cost - b.cost || b.value - a.value);
    const optimizedPathCombos = [];
    let maxAchievedValue = -1;
    for (const combo of currentPathCombinations) {
        if (combo.value > maxAchievedValue) {
            optimizedPathCombos.push(combo);
            maxAchievedValue = combo.value;
        }
    }
    // Ensure {cost:0, value:0} (take nothing) is always present.
    if (!optimizedPathCombos.some(c => c.cost === 0 && c.value === 0)) {
        optimizedPathCombos.unshift({cost:0, value:0});
    }

    // Resolve queries for this node (currentNodeIdx).
    // This is equivalent to the query resolution loop inside `qz` from the original.
    if (currentNodeQueryInfo) {
        for (const query of currentNodeQueryInfo.individualQueryList) {
            let bestValueForQuery = finalOutputRecords[query.queryId] || 0;
            for (const blockCombo of optimizedPathCombos) {
                if (query.capacityLimit >= blockCombo.cost) {
                    const remainingCapacity = query.capacityLimit - blockCombo.cost;
                    if (remainingCapacity < baseKnapsackStateForBlock.length) {
                        bestValueForQuery = Math.max(bestValueForQuery, baseKnapsackStateForBlock[remainingCapacity] + blockCombo.value);
                    }
                }
            }
            finalOutputRecords[query.queryId] = bestValueForQuery;
        }
    }

    // Recurse for children, passing the optimized combinations.
    processDeepSubtreeBlock(2 * currentNodeIdx + 1, baseKnapsackStateForBlock, optimizedPathCombos);
    processDeepSubtreeBlock(2 * currentNodeIdx + 2, baseKnapsackStateForBlock, optimizedPathCombos);
}

// --- Main Execution Logic ---
function executeSolution() {
    totalNodeCount = inputProcessor.fetchNextNumber();
    const minNodeCount = Math.min(totalNodeCount, 1 << DEEP_TRAVERSAL_THRESHOLD_DEPTH); // Original 'mn' (unused in my clone)

    const rawNodeData = inputProcessor.fetchNumberGrid(totalNodeCount, 2);
    nodeAttributesCollection = rawNodeData.map(pair => new ItemAttributes(pair[0], pair[1]));

    const totalQueries = inputProcessor.fetchNextNumber();
    finalOutputRecords = Array(totalQueries).fill(0); // Initialize results array

    // Process queries to populate `queryMap` and determine `maximumCapacityRequired`.
    for (let i = 0; i < totalQueries; i++) {
        const targetNode = inputProcessor.fetchNextNumber() - 1; // 0-indexed
        const capacityRequested = inputProcessor.fetchNextNumber();

        if (!queryMap.has(targetNode)) {
            queryMap.set(targetNode, new QueryDetails());
        }
        queryMap.get(targetNode).addQuery(i, capacityRequested);
    }

    // Pre-calculate max capacities needed for each subtree (similar to `need[u][0]` propagation).
    computeSubtreeCapacityNeeds(0);

    // Initial knapsack state for the root node (capacity 0 has value 0).
    // The size of this array is determined by the max capacity needed for the root's subtree.
    const rootMaxCapacity = (queryMap.has(0) ? queryMap.get(0).maximumCapacityRequired : 0) + 1;
    const initialRootKnapsackState = Array(rootMaxCapacity).fill(0);

    // Start the recursive tree traversal and knapsack solving process.
    solveTreePath(0, 0, initialRootKnapsackState);

    return finalOutputRecords.join("\n");
}

const solutionResult = executeSolution();
if (solutionResult !== undefined) {
    console.log(String(solutionResult));
}