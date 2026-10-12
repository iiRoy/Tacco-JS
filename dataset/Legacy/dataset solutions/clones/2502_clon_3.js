"use strict";

class InputReader {
    constructor(rawInput) {
        this.allLines = rawInput.trim().split("\n");
        this.currentLineIndex = 0;
        this.currentLineItems = [];
    }

    _parseValue(value, asString) {
        return asString ? value : Number(value);
    }

    readNextItem(asString = false) {
        if (this.currentLineItems.length === 0) {
            if (this.currentLineIndex >= this.allLines.length) {
                return undefined;
            }
            this.currentLineItems = this.allLines[this.currentLineIndex].split(" ");
        }

        const item = this.currentLineItems.shift();
        if (this.currentLineItems.length === 0) {
            this.currentLineIndex++;
        }
        return this._parseValue(item, asString);
    }

    readLineItems(asString = false) {
        if (this.currentLineIndex >= this.allLines.length) {
            return [];
        }
        this.currentLineItems = [];
        const line = this.allLines[this.currentLineIndex++];
        const items = line.split(" ");
        return asString ? items : items.map(item => Number(item));
    }

    readMatrix(numRows, asString = false) {
        const matrix = [];
        for (let i = 0; i < numRows; i++) {
            matrix.push(this.readLineItems(asString));
        }
        return matrix;
    }

    readVector(numItems, asString = false) {
        const vector = [];
        for (let i = 0; i < numItems; i++) {
            this.currentLineItems = [];
            if (this.currentLineIndex >= this.allLines.length) {
                return vector;
            }
            const line = this.allLines[this.currentLineIndex++];
            const item = line.trim();
            vector.push(this._parseValue(item, asString));
        }
        return vector;
    }
}

const inputReader = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);

    const arr = new Array(currentDimSize);
    for (let i = 0; i < currentDimSize; i++) {
        arr[i] = createMultiDimArray(initialValue, ...remainingDims);
    }
    return arr;
}

const MAX_DIST = 1e15;

function runFloydWarshall(distanceMatrix, numNodes, infinityValue) {
    for (let intermediateNode = 0; intermediateNode < numNodes; intermediateNode++) {
        for (let startNode = 0; startNode < numNodes; startNode++) {
            for (let endNode = 0; endNode < numNodes; endNode++) {
                const pathThroughIntermediate = distanceMatrix[startNode][intermediateNode] + distanceMatrix[intermediateNode][endNode];
                if (distanceMatrix[startNode][intermediateNode] < infinityValue &&
                    distanceMatrix[intermediateNode][endNode] < infinityValue &&
                    pathThroughIntermediate < distanceMatrix[startNode][endNode]) {
                    distanceMatrix[startNode][endNode] = pathThroughIntermediate;
                }
            }
        }
    }
}

function transformDistanceMatrix(distanceMatrix, numNodes, maxAllowedPathLength, infinityValue) {
    for (let i = 0; i < numNodes; i++) {
        for (let j = 0; j < numNodes; j++) {
            if (distanceMatrix[i][j] === 0) {
                continue;
            }
            if (distanceMatrix[i][j] > maxAllowedPathLength) {
                distanceMatrix[i][j] = infinityValue;
            } else {
                distanceMatrix[i][j] = 1;
            }
        }
    }
}

function processQueries(queryPairs, distanceMatrix, infinityValue) {
    const resultsBuffer = [];
    for (let i = 0; i < queryPairs.length; i++) {
        const sourceNode = queryPairs[i][0] - 1;
        const destinationNode = queryPairs[i][1] - 1;
        let pathQueryResult = distanceMatrix[sourceNode][destinationNode];

        if (pathQueryResult >= infinityValue) {
            pathQueryResult = 0;
        }
        resultsBuffer.push(pathQueryResult - 1);
    }
    return resultsBuffer;
}

function main() {
    const numNodes = inputReader.readNextItem();
    const numEdges = inputReader.readNextItem();
    const maxAllowedPathLength = inputReader.readNextItem();
    const edgeData = inputReader.readMatrix(numEdges);
    const numQueries = inputReader.readNextItem();
    const queryPairs = inputReader.readMatrix(numQueries);

    const distanceMatrix = createMultiDimArray(MAX_DIST, numNodes, numNodes);

    for (let i = 0; i < numNodes; i++) {
        distanceMatrix[i][i] = 0;
    }

    for (const edge of edgeData) {
        const fromNode = edge[0] - 1;
        const toNode = edge[1] - 1;
        const weight = edge[2];
        distanceMatrix[fromNode][toNode] = weight;
        distanceMatrix[toNode][fromNode] = weight;
    }

    runFloydWarshall(distanceMatrix, numNodes, MAX_DIST);

    transformDistanceMatrix(distanceMatrix, numNodes, maxAllowedPathLength, MAX_DIST);

    runFloydWarshall(distanceMatrix, numNodes, MAX_DIST);

    const finalResults = processQueries(queryPairs, distanceMatrix, MAX_DIST);

    return finalResults.join("\n");
}

console.log(main());
