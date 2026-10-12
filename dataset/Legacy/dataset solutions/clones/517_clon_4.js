const fileSystem = require('fs');
const standardInputDescriptor = process.stdin.fd;
const inputSize = fileSystem.fstatSync(standardInputDescriptor).size;
const dataBuffer = Buffer.alloc(inputSize);
const bytesTransferred = fileSystem.readSync(standardInputDescriptor, dataBuffer, 0, inputSize, 0);
const rawInputLines = dataBuffer.toString('utf8', 0, bytesTransferred).split('\n');

let currentInputPointer = 0;

const retrieveNextNumericLine = () => {
    const value = rawInputLines[currentInputPointer];
    currentInputPointer++;
    return Number(value);
};

const createDistanceMatrix = (dimension) => {
    return Array.from({ length: dimension }, (_, rowIndex) =>
        Array.from({ length: dimension }, (_, colIndex) =>
            rowIndex === colIndex ? 0 : Infinity
        )
    );
};

const computeAllPaths = (distanceMatrix) => {
    const matrixDimension = distanceMatrix.length;

    for (let intermediateNode = 0; intermediateNode < matrixDimension; intermediateNode++) {
        for (let sourceNode = 0; sourceNode < matrixDimension; sourceNode++) {
            for (let targetNode = 0; targetNode < matrixDimension; targetNode++) {
                distanceMatrix[sourceNode][targetNode] = Math.min(
                    distanceMatrix[sourceNode][targetNode],
                    distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][targetNode]
                );
            }
        }
    }
    return distanceMatrix;
};

const calculateNextPosition = (startNode, stepCount, totalNodesCount, pathDataArray) => {
    const potentialIndex = startNode + stepCount;
    const dataValue = (potentialIndex < totalNodesCount + 1) ? pathDataArray[potentialIndex] : 0;
    const rawCalculatedPosition = startNode + stepCount + dataValue;
    return Math.min(Math.max(rawCalculatedPosition, 0), totalNodesCount + 1);
};

const evaluateReachability = (maxSteps, totalNodesCount, pathDataArray) => {
    const graphMatrix = createDistanceMatrix(totalNodesCount + 2);

    const generatedEdges = Array.from({ length: totalNodesCount + 1 }, (_, currentNode) =>
        Array.from({ length: maxSteps }, (_, stepOffset) => {
            const nextPosition = calculateNextPosition(currentNode, stepOffset, totalNodesCount, pathDataArray);
            return (currentNode !== nextPosition) ? [currentNode, nextPosition] : null;
        })
    ).flat().filter(Boolean);

    generatedEdges.forEach(([source, destination]) => {
        graphMatrix[source][destination] = 1;
    });

    computeAllPaths(graphMatrix);

    const hasUnreachableTerminal = Array.from({ length: totalNodesCount + 1 }, (_, nodeIndex) => nodeIndex)
        .some(intermediatePoint =>
            graphMatrix[0][intermediatePoint] < Infinity &&
            graphMatrix[intermediatePoint][totalNodesCount + 1] === Infinity
        );

    return !hasUnreachableTerminal;
};

let currentMaxSteps;
while (true) {
    currentMaxSteps = retrieveNextNumericLine();
    if (currentMaxSteps === 0) {
        break;
    }

    const currentTotalNodes = retrieveNextNumericLine();
    const pathData = new Array(currentTotalNodes + 2);
    pathData[0] = 0;
    pathData[currentTotalNodes + 1] = 0;

    Array.from({ length: currentTotalNodes }, (_, index) => index + 1)
        .forEach(nodeIndex => {
            pathData[nodeIndex] = retrieveNextNumericLine();
        });

    const resultStatus = evaluateReachability(currentMaxSteps, currentTotalNodes, pathData) ? 'OK' : 'NG';
    console.log(resultStatus);
}
