const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const allLines = inputSource.trim().split("\n");
let currentLineIndex = 0;

function retrieveNextLine() {
    return allLines[currentLineIndex++];
}

function parseLineToNumbers() {
    return retrieveNextLine().split(" ").map(Number);
}

let pathDataMatrix;
let graphNodeCount;

function calculateAllShortestPaths(nodeQuantity, pathInformation) {
    for (let pivotNode = 0; pivotNode < nodeQuantity; ++pivotNode) {
        for (let originNode = 0; originNode < nodeQuantity; ++originNode) {
            for (let destinationNode = 0; destinationNode < nodeQuantity; ++destinationNode) {
                const existingPath = pathInformation[originNode][destinationNode];
                const pathViaPivot = {
                    cost: pathInformation[originNode][pivotNode].cost + pathInformation[pivotNode][destinationNode].cost,
                    time: pathInformation[originNode][pivotNode].time + pathInformation[pivotNode][destinationNode].time
                };

                if (pathViaPivot.cost < existingPath.cost) {
                    existingPath.cost = pathViaPivot.cost;
                }
                if (pathViaPivot.time < existingPath.time) {
                    existingPath.time = pathViaPivot.time;
                }
            }
        }
    }
}

while (true) {
    const graphDimensions = parseLineToNumbers();
    const numberOfEdges = graphDimensions[0];
    graphNodeCount = graphDimensions[1];

    if (numberOfEdges === 0 && graphNodeCount === 0) {
        break;
    }

    pathDataMatrix = Array.from({ length: 101 }, (_, rowIdx) =>
        Array.from({ length: 101 }, (_, colIdx) => ({
            cost: (rowIdx === colIdx) ? 0 : Infinity,
            time: (rowIdx === colIdx) ? 0 : Infinity
        }))
    );

    for (let edgeIdx = 0; edgeIdx < numberOfEdges; ++edgeIdx) {
        const edgeDefinition = parseLineToNumbers();
        const startVertex = edgeDefinition[0] - 1;
        const endVertex = edgeDefinition[1] - 1;
        pathDataMatrix[startVertex][endVertex].cost = edgeDefinition[2];
        pathDataMatrix[startVertex][endVertex].time = edgeDefinition[3];
    }

    calculateAllShortestPaths(graphNodeCount, pathDataMatrix);

    const numberOfQueries = Number(retrieveNextLine());
    for (let queryIdx = 0; queryIdx < numberOfQueries; ++queryIdx) {
        const queryParameters = parseLineToNumbers();
        const queryStart = queryParameters[0] - 1;
        const queryEnd = queryParameters[1] - 1;
        const queryMetricType = queryParameters[2];

        if (queryMetricType === 0) {
            console.log(pathDataMatrix[queryStart][queryEnd].cost);
        } else {
            console.log(pathDataMatrix[queryStart][queryEnd].time);
        }
    }
}
