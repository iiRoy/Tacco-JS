const fileSystem = require('fs');

let tokenArray;
let currentPosition = 0;

function prepareInput(sourceString) {
    tokenArray = sourceString.trim().split(/\s+/g);
    currentPosition = 0;
}

function retrieveStringToken() {
    if (currentPosition >= tokenArray.length) {
        throw new Error("End of input stream reached.");
    }
    return tokenArray[currentPosition++];
}

function obtainIntegerToken() {
    return parseInt(retrieveStringToken(), 10);
}

const largeValue = Infinity;

function determineShortestPaths(adjacencyMatrix) {
    const totalVertices = adjacencyMatrix.length;
    const resultMatrix = Array.from({ length: totalVertices }, (_, rIdx) => 
        Array.from({ length: totalVertices }, (_, cIdx) => adjacencyMatrix[rIdx][cIdx])
    );

    for (let kStep = 0; kStep < totalVertices; kStep++) {
        for (let iStart = 0; iStart < totalVertices; iStart++) {
            for (let jEnd = 0; jEnd < totalVertices; jEnd++) {
                const throughK = resultMatrix[iStart][kStep] + resultMatrix[kStep][jEnd];
                if (resultMatrix[iStart][jEnd] > throughK) {
                    resultMatrix[iStart][jEnd] = throughK;
                }
            }
        }
    }
    return resultMatrix;
}

function executeGraphAnalysis() {
    const numNodes = obtainIntegerToken();
    const numEdges = obtainIntegerToken();
    const maxAllowedWeight = obtainIntegerToken();

    let graphOneDistances = Array.from({ length: numNodes }, () => Array(numNodes).fill(largeValue));
    for (let idx = 0; idx < numNodes; idx++) {
        graphOneDistances[idx][idx] = 0;
    }

    for (let eIdx = 0; eIdx < numEdges; eIdx++) {
        const nodeA = obtainIntegerToken() - 1;
        const nodeB = obtainIntegerToken() - 1;
        const edgeCost = obtainIntegerToken();
        graphOneDistances[nodeA][nodeB] = edgeCost;
        graphOneDistances[nodeB][nodeA] = edgeCost; // Undirected
    }

    const firstPassResults = determineShortestPaths(graphOneDistances);

    let graphTwoDistances = Array.from({ length: numNodes }, () => Array(numNodes).fill(largeValue));
    for (let idx = 0; idx < numNodes; idx++) {
        graphTwoDistances[idx][idx] = 0;
    }

    for (let rIdx = 0; rIdx < numNodes; rIdx++) {
        for (let cIdx = 0; cIdx < numNodes; cIdx++) {
            if (firstPassResults[rIdx][cIdx] <= maxAllowedWeight) {
                graphTwoDistances[rIdx][cIdx] = 1;
            }
        }
    }

    const secondPassResults = determineShortestPaths(graphTwoDistances);

    const numQueries = obtainIntegerToken();
    const outputCollection = [];

    for (let qIdx = 0; qIdx < numQueries; qIdx++) {
        const startNode = obtainIntegerToken() - 1;
        const endNode = obtainIntegerToken() - 1;
        const finalPathValue = secondPassResults[startNode][endNode];

        if (finalPathValue === largeValue) {
            outputCollection.push("-1");
        } else {
            outputCollection.push((finalPathValue - 1).toString());
        }
    }
    process.stdout.write(outputCollection.join('\n'));
}

const inputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
prepareInput(inputContent);
executeGraphAnalysis();