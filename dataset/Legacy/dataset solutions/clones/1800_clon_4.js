"use strict";

let inputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenArray = inputBuffer.split(/ |\n/);
let tokenIndex = 0;

function readNumber() {
    return +tokenArray[tokenIndex++];
}

function readString() {
    return tokenArray[tokenIndex++];
}

function readBigInt() {
    return BigInt(tokenArray[tokenIndex++]);
}

function readNumbers(count, mapToNum = true) {
    const result = tokenArray.slice(tokenIndex, tokenIndex + count);
    tokenIndex += count;
    return mapToNum ? result.map(Number) : result;
}

function readMatrix(rows, cols, mapToNum = true) {
    const matrix = [];
    for (let r = 0; r < rows; r++) {
        matrix.push(readNumbers(cols, mapToNum));
    }
    return matrix;
}

function createMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDim = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentDim }, () =>
        createMultiDimArray(initialValue, ...remainingDims)
    );
}

class TreeNode {
    constructor(identifier, itemValue, itemWeight) {
        this.identifier = identifier;
        this.itemValue = itemValue;
        this.itemWeight = itemWeight;
        this.maxQueryLimit = 0;
        this.queries = [];
    }
}

let treeNodesGlobal;

const programOutput = mainLogic();
if (programOutput !== undefined) {
    console.log(String(programOutput));
}

function mainLogic() {
    const DP_DEPTH_THRESHOLD = 10;

    const nodeCount = readNumber();
    const nodeItemData = readMatrix(nodeCount, 2);

    const queryCount = readNumber();

    treeNodesGlobal = Array.from({ length: nodeCount }, (_, i) =>
        new TreeNode(i, nodeItemData[i][0], nodeItemData[i][1])
    );

    for (let i = 0; i < queryCount; i++) {
        const targetNodeIdentifier = readNumber() - 1;
        const queryLimit = readNumber();
        treeNodesGlobal[targetNodeIdentifier].queries.push([i, queryLimit]);
        treeNodesGlobal[targetNodeIdentifier].maxQueryLimit = Math.max(treeNodesGlobal[targetNodeIdentifier].maxQueryLimit, queryLimit);
    }

    for (let i = Math.floor((nodeCount - 1 - 1) / 2); i >= 0; i--) {
        const currentNode = treeNodesGlobal[i];
        const leftChildIdentifier = 2 * i + 1;
        const rightChildIdentifier = 2 * i + 2;

        if (leftChildIdentifier < nodeCount) {
            currentNode.maxQueryLimit = Math.max(currentNode.maxQueryLimit, treeNodesGlobal[leftChildIdentifier].maxQueryLimit);
        }
        if (rightChildIdentifier < nodeCount) {
            currentNode.maxQueryLimit = Math.max(currentNode.maxQueryLimit, treeNodesGlobal[rightChildIdentifier].maxQueryLimit);
        }
    }

    const allQueryAnswers = createMultiDimArray(0, queryCount);

    if (nodeCount > 0) {
        const rootMaxLimit = treeNodesGlobal[0].maxQueryLimit;
        const initialParentKnapsack = new Array(rootMaxLimit + 1).fill(0);

        processTreeRecursive(treeNodesGlobal[0], initialParentKnapsack, 0, allQueryAnswers, nodeCount, DP_DEPTH_THRESHOLD);
    }

    return allQueryAnswers.join("\n");
}

function processTreeRecursive(
    currentNode,
    parentKnapsackTable,
    currentDepth,
    allQueryAnswers,
    totalNodes,
    maxDepthForFullDP
) {
    if (!currentNode || currentNode.maxQueryLimit === 0) {
        return;
    }

    const currentMaxCapacity = currentNode.maxQueryLimit;
    let currentKnapsackTable = new Array(currentMaxCapacity + 1).fill(0);

    for (let i = 0; i <= currentMaxCapacity; i++) {
        if (i < parentKnapsackTable.length) {
            currentKnapsackTable[i] = parentKnapsackTable[i];
        }
    }

    for (let capacity = currentMaxCapacity; capacity >= currentNode.itemWeight; capacity--) {
        currentKnapsackTable[capacity] = Math.max(
            currentKnapsackTable[capacity],
            currentKnapsackTable[capacity - currentNode.itemWeight] + currentNode.itemValue
        );
    }

    for (const [queryIndex, limit] of currentNode.queries) {
        allQueryAnswers[queryIndex] = currentKnapsackTable[limit];
    }

    const leftChildIdentifier = 2 * currentNode.identifier + 1;
    const rightChildIdentifier = 2 * currentNode.identifier + 2;

    if (currentDepth < maxDepthForFullDP - 1) {
        if (leftChildIdentifier < totalNodes) {
            processTreeRecursive(treeNodesGlobal[leftChildIdentifier], currentKnapsackTable, currentDepth + 1, allQueryAnswers, totalNodes, maxDepthForFullDP);
        }
        if (rightChildIdentifier < totalNodes) {
            processTreeRecursive(treeNodesGlobal[rightChildIdentifier], currentKnapsackTable, currentDepth + 1, allQueryAnswers, totalNodes, maxDepthForFullDP);
        }
    } else {
        const initialDeepPathItems = new Map([[0, 0]]);
        if (leftChildIdentifier < totalNodes) {
            processDeepSubtree(treeNodesGlobal[leftChildIdentifier], currentKnapsackTable, initialDeepPathItems, allQueryAnswers, totalNodes);
        }
        if (rightChildIdentifier < totalNodes) {
            processDeepSubtree(treeNodesGlobal[rightChildIdentifier], currentKnapsackTable, initialDeepPathItems, allQueryAnswers, totalNodes);
        }
    }
}

function processDeepSubtree(
    currentNode,
    ancestorKnapsackTable,
    currentPathItemsMap,
    allQueryAnswers,
    totalNodes
) {
    if (!currentNode || currentNode.maxQueryLimit === 0) {
        return;
    }

    const newPathItemsMap = new Map(currentPathItemsMap);
    const currentItemWeight = currentNode.itemWeight;
    const currentItemValue = currentNode.itemValue;
    const currentMaxCapacity = currentNode.maxQueryLimit;

    const combinationsToUpdate = [];
    for (const [existingPathWeight, existingPathValue] of currentPathItemsMap.entries()) {
        const combinedWeight = existingPathWeight + currentItemWeight;
        const combinedValue = existingPathValue + currentItemValue;
        if (combinedWeight <= currentMaxCapacity) {
            combinationsToUpdate.push([combinedWeight, combinedValue]);
        }
    }

    for (const [weight, value] of combinationsToUpdate) {
        newPathItemsMap.set(weight, Math.max(newPathItemsMap.get(weight) || 0, value));
    }

    for (const [queryIndex, limit] of currentNode.queries) {
        let maxCombinedValue = 0;
        for (const [pathWeight, pathValue] of newPathItemsMap.entries()) {
            if (limit >= pathWeight) {
                const remainingCapacity = limit - pathWeight;
                const ancestorValue = (remainingCapacity < ancestorKnapsackTable.length) ? ancestorKnapsackTable[remainingCapacity] : 0;
                maxCombinedValue = Math.max(maxCombinedValue, pathValue + ancestorValue);
            }
        }
        allQueryAnswers[queryIndex] = maxCombinedValue;
    }

    const leftChildIdentifier = 2 * currentNode.identifier + 1;
    const rightChildIdentifier = 2 * currentNode.identifier + 2;

    if (leftChildIdentifier < totalNodes) {
        processDeepSubtree(treeNodesGlobal[leftChildIdentifier], ancestorKnapsackTable, newPathItemsMap, allQueryAnswers, totalNodes);
    }
    if (rightChildIdentifier < totalNodes) {
        processDeepSubtree(treeNodesGlobal[rightChildIdentifier], ancestorKnapsackTable, newPathItemsMap, allQueryAnswers, totalNodes);
    }
}
