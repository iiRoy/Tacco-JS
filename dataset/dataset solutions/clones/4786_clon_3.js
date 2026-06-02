class InputProcessor {
    #sourceLines;
    #currentLineIndex;

    constructor(sourceString) {
        this.#sourceLines = sourceString.trim().split("\n");
        this.#currentLineIndex = 0;
    }

    #toNumber(value) {
        return +value;
    }

    readNextNumber(returnAsString = false) {
        if (this.#currentLineIndex >= this.#sourceLines.length) {
            return undefined;
        }

        let currentLineData = this.#sourceLines[this.#currentLineIndex];

        if (typeof currentLineData === "string") {
            currentLineData = currentLineData.split(" ").reverse();
            this.#sourceLines[this.#currentLineIndex] = currentLineData;
        }

        const token = currentLineData.pop();

        if (currentLineData.length === 0) {
            this.#currentLineIndex++;
        }
        return returnAsString ? token : this.#toNumber(token);
    }

    readLineTokens(returnAsString = false) {
        if (this.#currentLineIndex >= this.#sourceLines.length) {
            return undefined;
        }
        const lineContent = this.#sourceLines[this.#currentLineIndex];
        this.#currentLineIndex++;
        return returnAsString ? lineContent.split(" ") : lineContent.split(" ").map(item => this.#toNumber(item));
    }

    readMatrix(rowCount, returnAsString = false) {
        const matrixRows = [];
        for (let i = 0; i < rowCount; i++) {
            if (this.#currentLineIndex >= this.#sourceLines.length) {
                break;
            }
            const lineContent = this.#sourceLines[this.#currentLineIndex];
            this.#currentLineIndex++;
            matrixRows.push(returnAsString ? lineContent.split(" ") : lineContent.split(" ").map(item => this.#toNumber(item)));
        }
        return matrixRows;
    }

    readRawLines(rowCount, returnAsString = false) {
        const rawLines = [];
        for (let i = 0; i < rowCount; i++) {
            if (this.#currentLineIndex >= this.#sourceLines.length) {
                break;
            }
            const lineContent = this.#sourceLines[this.#currentLineIndex];
            this.#currentLineIndex++;
            rawLines.push(returnAsString ? lineContent : this.#toNumber(lineContent));
        }
        return rawLines;
    }
}

function createMultiDimArray(initialValue, ...dimensions) {
    const createArrayRecursive = (dimIndex) => {
        if (dimIndex === dimensions.length - 1) {
            return Array(dimensions[dimIndex]).fill(initialValue);
        } else {
            return Array(dimensions[dimIndex]).fill(0).map(() => createArrayRecursive(dimIndex + 1));
        }
    };
    return createArrayRecursive(0);
}

const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
const inputReader = new InputProcessor(inputData);

const MAX_DISTANCE_VALUE = 1e9;

function solveShortestPaths() {
    const numNodes = inputReader.readNextNumber();
    const numEdges = inputReader.readNextNumber();

    const distanceMatrix = createMultiDimArray(MAX_DISTANCE_VALUE, numNodes, numNodes);

    for (let nodeIndex = 0; nodeIndex < numNodes; nodeIndex++) {
        distanceMatrix[nodeIndex][nodeIndex] = 0;
    }

    const edgeConnectionsRaw = inputReader.readMatrix(numEdges);

    const originalEdgesProcessed = [];

    for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
        let startNode = edgeConnectionsRaw[edgeIdx][0];
        let endNode = edgeConnectionsRaw[edgeIdx][1];
        const edgeWeight = edgeConnectionsRaw[edgeIdx][2];

        startNode--;
        endNode--;

        originalEdgesProcessed.push({
            u: startNode,
            v: endNode,
            w: edgeWeight
        });

        distanceMatrix[startNode][endNode] = edgeWeight;
        distanceMatrix[endNode][startNode] = edgeWeight;
    }

    for (let intermediateNode = 0; intermediateNode < numNodes; intermediateNode++) {
        for (let sourceNode = 0; sourceNode < numNodes; sourceNode++) {
            for (let destNode = 0; destNode < numNodes; destNode++) {
                const pathThroughIntermediate = distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][destNode];
                if (distanceMatrix[sourceNode][destNode] > pathThroughIntermediate) {
                    distanceMatrix[sourceNode][destNode] = pathThroughIntermediate;
                }
            }
        }
    }

    let redundantEdgeCount = 0;
    for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
        const currentEdge = originalEdgesProcessed[edgeIdx];
        if (distanceMatrix[currentEdge.u][currentEdge.v] < currentEdge.w) {
            redundantEdgeCount++;
        }
    }

    return redundantEdgeCount;
}

console.log(solveShortestPaths());
