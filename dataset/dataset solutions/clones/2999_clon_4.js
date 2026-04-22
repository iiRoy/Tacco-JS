let inputLines = [];
let currentLineIndex = 0;

const processInputData = (allTextContent) => {
    inputLines = allTextContent.trim().split("\n");
    currentLineIndex = 0;
};

const retrieveSingleInteger = () => {
    const currentInputLine = inputLines[currentLineIndex].trim();
    currentLineIndex++;
    return parseInt(currentInputLine, 10);
};

const retrieveIntegerArray = () => {
    const currentInputLine = inputLines[currentLineIndex].trim();
    currentLineIndex++;
    return currentInputLine.split(" ").map(Number);
};

const constructMultiDimensionalArray = (initialElement, ...dimensions) => {
    if (dimensions.length === 0) {
        return initialElement;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array.from({ length: currentDimensionSize }, () =>
        constructMultiDimensionalArray(initialElement, ...remainingDimensions)
    );
};

function determineTreeProperty() {
    const totalNodes = retrieveSingleInteger();

    const graphConnections = constructMultiDimensionalArray([], totalNodes);

    for (let k = 0; k < totalNodes - 1; k++) {
        const edgeDefinition = retrieveIntegerArray().map(val => val - 1);
        graphConnections[edgeDefinition[0]].push(edgeDefinition[1]);
        graphConnections[edgeDefinition[1]].push(edgeDefinition[0]);
    }

    const initialTraversalStartNode = 0;
    let distancesFromFirstSource = constructMultiDimensionalArray(-1, totalNodes);
    let bfsQueue = [];

    bfsQueue.push(initialTraversalStartNode);
    distancesFromFirstSource[initialTraversalStartNode] = 0;

    let nodeMostDistantFromStart = initialTraversalStartNode;
    let maximumDistanceEncountered = 0;

    let queuePointer = 0;
    while (queuePointer < bfsQueue.length) {
        const currentVertexId = bfsQueue[queuePointer++];

        if (distancesFromFirstSource[currentVertexId] > maximumDistanceEncountered) {
            maximumDistanceEncountered = distancesFromFirstSource[currentVertexId];
            nodeMostDistantFromStart = currentVertexId;
        }

        for (const connectedNeighbor of graphConnections[currentVertexId]) {
            if (distancesFromFirstSource[connectedNeighbor] === -1) {
                distancesFromFirstSource[connectedNeighbor] = distancesFromFirstSource[currentVertexId] + 1;
                bfsQueue.push(connectedNeighbor);
            }
        }
    }

    const secondTraversalStartNode = nodeMostDistantFromStart;
    let distancesFromFarthestSource = constructMultiDimensionalArray(-1, totalNodes);
    bfsQueue = [];

    bfsQueue.push(secondTraversalStartNode);
    distancesFromFarthestSource[secondTraversalStartNode] = 0;

    let diameterOfTree = 0;

    queuePointer = 0;
    while (queuePointer < bfsQueue.length) {
        const currentVertexId = bfsQueue[queuePointer++];

        diameterOfTree = Math.max(diameterOfTree, distancesFromFarthestSource[currentVertexId]);

        for (const connectedNeighbor of graphConnections[currentVertexId]) {
            if (distancesFromFarthestSource[connectedNeighbor] === -1) {
                distancesFromFarthestSource[connectedNeighbor] = distancesFromFarthestSource[currentVertexId] + 1;
                bfsQueue.push(connectedNeighbor);
            }
        }
    }

    if (diameterOfTree % 3 === 1) {
        return "Second";
    } else {
        return "First";
    }
}

processInputData(require("fs").readFileSync("/dev/stdin","utf8"));
console.log(determineTreeProperty());