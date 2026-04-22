"use strict";

const createInputReader = (rawInputString) => {
    const allInputLines = rawInputString.trim().split("\n");
    let currentLinePointer = 0;
    let currentLineTokens = [];
    let currentTokenPointer = 0;

    const ensureTokens = () => {
        while (currentTokenPointer >= currentLineTokens.length) {
            if (currentLinePointer >= allInputLines.length) {
                throw new Error("End of input reached.");
            }
            currentLineTokens = allInputLines[currentLinePointer].split(" ");
            currentLinePointer++;
            currentTokenPointer = 0;
            if (currentLineTokens.length === 1 && currentLineTokens[0] === "") {
                currentLineTokens = [];
            }
        }
    };

    return {
        readSingleValue: (asString = false) => {
            ensureTokens();
            const token = currentLineTokens[currentTokenPointer++];
            return asString ? token : Number(token);
        },
        readLineValues: (asStrings = false) => {
            if (currentLinePointer >= allInputLines.length) {
                throw new Error("End of input reached.");
            }
            const line = allInputLines[currentLinePointer++];
            currentLineTokens = [];
            currentTokenPointer = 0;
            const values = line.split(" ");
            return asStrings ? values : values.map(Number);
        },
        readMatrix: (rows, asStrings = false) => {
            const matrix = [];
            for (let i = 0; i < rows; i++) {
                if (currentLinePointer >= allInputLines.length) {
                    throw new Error("End of input reached while reading matrix.");
                }
                const line = allInputLines[currentLinePointer++];
                currentLineTokens = [];
                currentTokenPointer = 0;
                const values = line.split(" ");
                matrix.push(asStrings ? values : values.map(Number));
            }
            return matrix;
        },
        readColumn: (rows, asStrings = false) => {
            const column = [];
            for (let i = 0; i < rows; i++) {
                if (currentLinePointer >= allInputLines.length) {
                    throw new Error("End of input reached while reading column.");
                }
                const line = allInputLines[currentLinePointer++];
                currentLineTokens = [];
                currentTokenPointer = 0;
                const value = line.split(" ")[0];
                column.push(asStrings ? value : Number(value));
            }
            return column;
        }
    };
};

const makeMultiArray = (initialValue, ...dimensions) => {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const [firstDim, ...restDims] = dimensions;
    return Array.from({ length: firstDim }, () => makeMultiArray(initialValue, ...restDims));
};

let nodeConnections;
let edgeCoverageMasks;

const tracePathFunctional = (
    currentVertex,
    destinationVertex,
    previousVertex,
    connections
) => {
    if (currentVertex === destinationVertex) {
        return [currentVertex];
    }

    for (const adjacentVertex of connections[currentVertex]) {
        if (adjacentVertex === previousVertex) {
            continue;
        }
        const subPath = tracePathFunctional(
            adjacentVertex,
            destinationVertex,
            currentVertex,
            connections
        );
        if (subPath) {
            return [currentVertex, ...subPath];
        }
    }
    return null;
};

const processSolution = () => {
    const inputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

    const nodeCount = inputReader.readSingleValue();
    const originalEdgeIndices = new Map(); // Maps string "min,max" to its 0-indexed position

    nodeConnections = makeMultiArray([], nodeCount);
    edgeCoverageMasks = makeMultiArray(0, nodeCount - 1);

    for (let currentEdgeIndex = 0; currentEdgeIndex < nodeCount - 1; currentEdgeIndex++) {
        const sourceNode = inputReader.readSingleValue() - 1;
        const targetNode = inputReader.readSingleValue() - 1;

        const smallerNode = Math.min(sourceNode, targetNode);
        const largerNode = Math.max(sourceNode, targetNode);
        originalEdgeIndices.set(`${smallerNode},${largerNode}`, currentEdgeIndex);

        nodeConnections[sourceNode].push(targetNode);
        nodeConnections[targetNode].push(sourceNode);
    }

    const queryCount = inputReader.readSingleValue();
    for (let currentQueryIndex = 0; currentQueryIndex < queryCount; currentQueryIndex++) {
        const pathStartNode = inputReader.readSingleValue() - 1;
        const pathEndNode = inputReader.readSingleValue() - 1;
        const currentQueryBit = 1 << currentQueryIndex;

        const pathNodes = tracePathFunctional(pathStartNode, pathEndNode, -1, nodeConnections);

        for (let pathSegmentIndex = 1; pathSegmentIndex < pathNodes.length; pathSegmentIndex++) {
            const segmentNodeA = pathNodes[pathSegmentIndex - 1];
            const segmentNodeB = pathNodes[pathSegmentIndex];

            const orderedNodeA = Math.min(segmentNodeA, segmentNodeB);
            const orderedNodeB = Math.max(segmentNodeA, segmentNodeB);

            const edgeIdentifier = `${orderedNodeA},${orderedNodeB}`;
            const edgeIndex = originalEdgeIndices.get(edgeIdentifier);
            if (edgeIndex === undefined) {
                 throw new Error("Graph edge not found during path traversal, unexpected state.");
            }
            edgeCoverageMasks[edgeIndex] |= currentQueryBit;
        }
    }

    const totalMaskCombinations = 1 << queryCount;
    let combinationsCount = makeMultiArray(0, totalMaskCombinations);
    combinationsCount[0] = 1;

    for (let edgeNum = 0; edgeNum < nodeCount - 1; edgeNum++) {
        const currentEdgeMask = edgeCoverageMasks[edgeNum];

        if (currentEdgeMask === 0) {
            combinationsCount = combinationsCount.map(count => count * 2);
        } else {
            const newCombinationsCount = makeMultiArray(0, totalMaskCombinations);
            for (let currentMaskValue = 0; currentMaskValue < totalMaskCombinations; currentMaskValue++) {
                if (combinationsCount[currentMaskValue] > 0) {
                    newCombinationsCount[currentMaskValue] += combinationsCount[currentMaskValue];
                    newCombinationsCount[currentMaskValue | currentEdgeMask] += combinationsCount[currentMaskValue];
                }
            }
            combinationsCount = newCombinationsCount;
        }
    }

    return combinationsCount[totalMaskCombinations - 1];
};

const finalResult = processSolution();
if (finalResult !== undefined) {
    console.log(finalResult);
}