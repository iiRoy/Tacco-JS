function calculateFloydWarshall(vertexCount, costMatrix, timeMatrix) {
    const numVertices = vertexCount;
    for (let pathIntermediate = 0; pathIntermediate < numVertices; pathIntermediate++) {
        for (let startNode = 0; startNode < numVertices; startNode++) {
            for (let endNode = 0; endNode < numVertices; endNode++) {
                const currentCost = costMatrix[startNode][endNode];
                const costViaIntermediate = costMatrix[startNode][pathIntermediate] + costMatrix[pathIntermediate][endNode];
                costMatrix[startNode][endNode] = Math.min(currentCost, costViaIntermediate);

                const currentTime = timeMatrix[startNode][endNode];
                const timeViaIntermediate = timeMatrix[startNode][pathIntermediate] + timeMatrix[pathIntermediate][endNode];
                timeMatrix[startNode][endNode] = Math.min(currentTime, timeViaIntermediate);
            }
        }
    }
}

function createInitializedMatrices(size) {
    const newCostMatrix = [];
    const newTimeMatrix = [];
    for (let rowIdx = 0; rowIdx < size; rowIdx++) {
        newCostMatrix[rowIdx] = [];
        newTimeMatrix[rowIdx] = [];
        for (let colIdx = 0; colIdx < size; colIdx++) {
            const initialValue = (rowIdx === colIdx) ? 0 : Infinity;
            newCostMatrix[rowIdx][colIdx] = initialValue;
            newTimeMatrix[rowIdx][colIdx] = initialValue;
        }
    }
    return { costs: newCostMatrix, times: newTimeMatrix };
}

function parseEdgeDetails(edgeLine) {
    const parts = edgeLine.split(" ").map(Number);
    return {
        source: parts[0] - 1,
        destination: parts[1] - 1,
        edgeCost: parts[2],
        edgeTime: parts[3]
    };
}

function parseQueryDetails(queryLine) {
    const parts = queryLine.split(" ").map(Number);
    return {
        querySource: parts[0] - 1,
        queryDestination: parts[1] - 1,
        queryType: parts[2]
    };
}

function processGraphSet(inputLineBuffer) {
    while (true) {
        const graphParametersLine = inputLineBuffer.shift();
        const graphParameters = graphParametersLine.split(" ").map(Number);
        const numEdges = graphParameters[0];
        const numVertices = graphParameters[1];

        if (numEdges === 0 && numVertices === 0) {
            break;
        }

        const { costs: currentCosts, times: currentTimes } = createInitializedMatrices(numVertices);

        for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
            const edgeLine = inputLineBuffer.shift();
            const edgeInfo = parseEdgeDetails(edgeLine);
            currentCosts[edgeInfo.source][edgeInfo.destination] = edgeInfo.edgeCost;
            currentTimes[edgeInfo.source][edgeInfo.destination] = edgeInfo.edgeTime;
        }

        calculateFloydWarshall(numVertices, currentCosts, currentTimes);

        const numberOfQueriesLine = inputLineBuffer.shift();
        const numberOfQueries = Number(numberOfQueriesLine);

        for (let queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) {
            const queryLine = inputLineBuffer.shift();
            const queryInfo = parseQueryDetails(queryLine);
            const sourceNode = queryInfo.querySource;
            const destinationNode = queryInfo.queryDestination;
            const typeOfQuery = queryInfo.queryType;

            if (typeOfQuery === 0) {
                console.log(currentCosts[sourceNode][destinationNode]);
            } else if (typeOfQuery === 1) {
                console.log(currentTimes[sourceNode][destinationNode]);
            }
        }
    }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLineBuffer = fileContent.trim().split("\n");

processGraphSet(inputLineBuffer);
