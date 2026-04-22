class InputReader {
    constructor(sourceData) {
        this.inputLines = sourceData.trim().split("\n");
        this.currentLinePointer = 0;
    }

    retrieveNextSegment() {
        if (this.currentLinePointer >= this.inputLines.length) {
            return null;
        }
        return this.inputLines[this.currentLinePointer++];
    }

    extractNumericSequence() {
        const lineValue = this.retrieveNextSegment();
        if (lineValue === null) return null;
        return lineValue.split(" ").map(Number);
    }

    extractSingleNumber() {
        const lineValue = this.retrieveNextSegment();
        if (lineValue === null) return null;
        return Number(lineValue);
    }
}

const buildAdjacencyMatrix = (dimensions, initialValue = Number.MAX_SAFE_INTEGER) => {
    return Array.from({ length: dimensions }, (_, rowIndex) =>
        Array.from({ length: dimensions }, (_, colIndex) => (rowIndex === colIndex ? 0 : initialValue))
    );
};

const calculateOptimalPaths = (pathMatrix, graphSize) => {
    const pointIndices = Array.from({ length: graphSize }, (_, index) => index);

    pointIndices.forEach(intermediateVertex => {
        pointIndices.forEach(sourceVertex => {
            pointIndices.forEach(destinationVertex => {
                const throughCurrentIntermediate = pathMatrix[sourceVertex][intermediateVertex] + pathMatrix[intermediateVertex][destinationVertex];
                if (throughCurrentIntermediate < pathMatrix[sourceVertex][destinationVertex]) {
                    pathMatrix[sourceVertex][destinationVertex] = throughCurrentIntermediate;
                }
            });
        });
    });
    return pathMatrix;
};

const manageProcessingCycles = (dataSource) => {
    const dataParser = new InputReader(dataSource);
    const collectedOutputs = [];

    let cycleCount = 0;
    while (true) {
        cycleCount++;
        const graphParameters = dataParser.extractNumericSequence();
        if (graphParameters === null || (graphParameters[0] === 0 && graphParameters[1] === 0)) {
            break;
        }

        const edgeQuantity = graphParameters[0];
        const nodeQuantity = graphParameters[1];

        let costGrid = buildAdjacencyMatrix(nodeQuantity);
        let timeGrid = buildAdjacencyMatrix(nodeQuantity);

        for (let currentEdge = 0; currentEdge < edgeQuantity; currentEdge++) {
            const edgeData = dataParser.extractNumericSequence();
            const startPoint = edgeData[0] - 1;
            const endPoint = edgeData[1] - 1;
            const costValue = edgeData[2];
            const timeValue = edgeData[3];

            costGrid[startPoint][endPoint] = costValue;
            timeGrid[startPoint][endPoint] = timeValue;
        }

        const finalCostGrid = calculateOptimalPaths(costGrid, nodeQuantity);
        const finalTimeGrid = calculateOptimalPaths(timeGrid, nodeQuantity);

        const queryQuantity = dataParser.extractSingleNumber();
        for (let currentQuery = 0; currentQuery < queryQuantity; currentQuery++) {
            const queryData = dataParser.extractNumericSequence();
            const queryOrigin = queryData[0] - 1;
            const queryDestination = queryData[1] - 1;
            const querySpecification = queryData[2];

            if (querySpecification === 0) {
                collectedOutputs.push(finalCostGrid[queryOrigin][queryDestination]);
            } else {
                collectedOutputs.push(finalTimeGrid[queryOrigin][queryDestination]);
            }
        }
    }
    return collectedOutputs.join("\n");
};

const rawInputContent = globalThis.process?.versions?.node
    ? require('fs').readFileSync('/dev/stdin', 'utf8')
    : "";

const finalResult = manageProcessingCycles(rawInputContent);

if (globalThis.process?.versions?.node) {
    console.log(finalResult);
} else {
    console.log(finalResult);
}