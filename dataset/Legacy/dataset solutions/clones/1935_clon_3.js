"use strict";
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenBuffer = rawInputData.trim().split(/\s+/);
let tokenReadIndex = 0;

function readToken(asString) {
    const currentToken = tokenBuffer[tokenReadIndex++];
    return asString ? currentToken : +currentToken;
}

function readTokens(count, asString) {
    const tokens = tokenBuffer.slice(tokenReadIndex, tokenReadIndex + count);
    tokenReadIndex += count;
    return asString ? tokens : tokens.map(Number);
}

function createMultiDimArray(initialValue, ...dimensions) {
    const createRecursive = (dims, currentDimIndex) => {
        if (currentDimIndex === dims.length - 1) {
            return Array(dims[currentDimIndex]).fill(typeof initialValue === 'string' ? JSON.parse(initialValue) : initialValue);
        } else {
            return Array(dims[currentDimIndex]).fill(null).map(() => createRecursive(dims, currentDimIndex + 1));
        }
    };
    return createRecursive(dimensions, 0);
}

function findLowerBoundIndex(sortedArray, targetValue) {
    let low = 0;
    let high = sortedArray.length;
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (sortedArray[mid] < targetValue) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
}

let finalResults, dynamicProgressionState = [0];
let adjacencyListGraph, inputValuesArray;

const programOutput = executeMainProgram();
if (programOutput !== undefined) {
    console.log(programOutput);
}

function executeMainProgram() {
    const nodeCount = readToken();
    inputValuesArray = readTokens(nodeCount);

    adjacencyListGraph = createMultiDimArray("[]", nodeCount);

    for (let edgeIndex = 0; edgeIndex < nodeCount - 1; ++edgeIndex) {
        const nodeU = readToken() - 1;
        const nodeV = readToken() - 1;
        adjacencyListGraph[nodeU].push(nodeV);
        adjacencyListGraph[nodeV].push(nodeU);
    }

    finalResults = new Array(nodeCount).fill(0);

    performDepthFirstSearch(0, -1);

    return finalResults.join("\n");
}

function performDepthFirstSearch(currentNode, parentNode) {
    let insertionPointIndex = findLowerBoundIndex(dynamicProgressionState, inputValuesArray[currentNode]);
    let originalValueAtInsertionPoint = null;
    let isNewElementAdded = false;

    if (insertionPointIndex === dynamicProgressionState.length) {
        dynamicProgressionState.push(inputValuesArray[currentNode]);
        isNewElementAdded = true;
    } else {
        originalValueAtInsertionPoint = dynamicProgressionState[insertionPointIndex];
        dynamicProgressionState[insertionPointIndex] = inputValuesArray[currentNode];
    }

    finalResults[currentNode] = dynamicProgressionState.length - 1;

    for (const neighborNode of adjacencyListGraph[currentNode]) {
        if (neighborNode === parentNode) {
            continue;
        }
        performDepthFirstSearch(neighborNode, currentNode);
    }

    if (isNewElementAdded) {
        dynamicProgressionState.pop();
    } else {
        dynamicProgressionState[insertionPointIndex] = originalValueAtInsertionPoint;
    }
}
