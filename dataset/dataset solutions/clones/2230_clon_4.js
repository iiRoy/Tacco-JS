"use strict";

class InputHandler {
    #rawLines;
    #lineCursor = 0;
    #currentLineTokens = [];
    #currentTokenCursor = 0;

    constructor(inputString) {
        this.#rawLines = inputString.trim().split("\n");
    }

    #advanceLine() {
        if (this.#lineCursor >= this.#rawLines.length) {
            throw new Error("Input exhausted.");
        }
        this.#currentLineTokens = this.#rawLines[this.#lineCursor++].split(" ");
        this.#currentTokenCursor = 0;
    }

    fetchNextNumber() {
        if (this.#currentTokenCursor >= this.#currentLineTokens.length) {
            this.#advanceLine();
        }
        const token = this.#currentLineTokens[this.#currentTokenCursor++];
        return Number(token);
    }

    fetchLineAsNumbers() {
        this.#advanceLine();
        const numbers = this.#currentLineTokens.map(Number);
        this.#currentLineTokens = [];
        this.#currentTokenCursor = 0;
        return numbers;
    }

    fetchMatrixAsNumbers(rows) {
        const matrix = [];
        for (let r = 0; r < rows; r++) {
            matrix.push(this.fetchLineAsNumbers());
        }
        return matrix;
    }

    fetchLinesAsStrings(rows) {
        const lines = [];
        for (let r = 0; r < rows; r++) {
            lines.push(this.#rawLines[this.#lineCursor++]);
        }
        return lines;
    }
}

function initializeMultiArray(dimensions, initialValue) {
    let actualDimensions;
    let actualInitialValue;

    if (Array.isArray(dimensions)) {
        actualDimensions = dimensions;
        actualInitialValue = initialValue;
    } else {
        actualDimensions = Array.from(arguments).slice(0, -1);
        actualInitialValue = arguments[arguments.length - 1];
    }

    const createArrayRecursive = (dims, valProducer) => {
        if (dims.length === 1) {
            return Array.from({ length: dims[0] }, () => valProducer());
        } else {
            const currentDim = dims[0];
            const remainingDims = dims.slice(1);
            return Array.from({ length: currentDim }, () => createArrayRecursive(remainingDims, valProducer));
        }
    };

    const valueProducer = (actualInitialValue === "[]") ? () => [] : () => actualInitialValue;

    return createArrayRecursive(actualDimensions, valueProducer);
}

function findPathBFS(startNode, targetNode, adjMap) {
    const queue = [[startNode, [startNode]]];
    const visited = new Set([startNode]);

    while (queue.length > 0) {
        const [currentNode, currentPath] = queue.shift();

        if (currentNode === targetNode) {
            return currentPath;
        }

        const neighbors = adjMap.get(currentNode) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([neighbor, [...currentPath, neighbor]]);
            }
        }
    }
    return null;
}

const inputReader = new InputHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

let finalResult;

function processGraphQueries() {
    const nodeCount = inputReader.fetchNextNumber();
    
    const adjacencyMap = new Map();
    for (let i = 0; i < nodeCount; i++) {
        adjacencyMap.set(i, []);
    }

    const edgeLookup = new Map();
    for (let i = 0; i < nodeCount - 1; i++) {
        const nodeOne = inputReader.fetchNextNumber() - 1;
        const nodeTwo = inputReader.fetchNextNumber() - 1;

        const minNode = Math.min(nodeOne, nodeTwo);
        const maxNode = Math.max(nodeOne, nodeTwo);

        edgeLookup.set(`${minNode}-${maxNode}`, i);

        adjacencyMap.get(nodeOne).push(nodeTwo);
        adjacencyMap.get(nodeTwo).push(nodeOne);
    }

    const queryCount = inputReader.fetchNextNumber();
    const edgePathMasks = new Array(nodeCount - 1).fill(0);

    for (let qIdx = 0; qIdx < queryCount; qIdx++) {
        const queryStart = inputReader.fetchNextNumber() - 1;
        const queryEnd = inputReader.fetchNextNumber() - 1;
        const currentQueryBit = 1 << qIdx;

        const pathNodes = findPathBFS(queryStart, queryEnd, adjacencyMap);
        
        if (pathNodes) {
            for (let pIdx = 0; pIdx < pathNodes.length - 1; pIdx++) {
                const pathNodeA = pathNodes[pIdx];
                const pathNodeB = pathNodes[pIdx + 1];

                const minPathNode = Math.min(pathNodeA, pathNodeB);
                const maxPathNode = Math.max(pathNodeA, pathNodeB);
                
                const edgeKey = `${minPathNode}-${maxPathNode}`;
                const edgeIdx = edgeLookup.get(edgeKey);
                
                if (edgeIdx !== undefined) {
                    edgePathMasks[edgeIdx] |= currentQueryBit;
                }
            }
        }
    }

    const totalMaskCombinations = 1 << queryCount;
    let currentWays = new Array(totalMaskCombinations).fill(0);
    currentWays[0] = 1;

    for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
        const nextWays = new Array(totalMaskCombinations).fill(0);
        const currentEdgeMask = edgePathMasks[edgeIndex];

        for (let maskState = 0; maskState < totalMaskCombinations; maskState++) {
            if (currentWays[maskState] === 0) {
                continue;
            }

            nextWays[maskState] += currentWays[maskState];
            nextWays[maskState | currentEdgeMask] += currentWays[maskState];
        }
        currentWays = nextWays;
    }

    return currentWays[totalMaskCombinations - 1];
}

finalResult = processGraphQueries();

if (finalResult !== undefined) {
    console.log(finalResult);
}
