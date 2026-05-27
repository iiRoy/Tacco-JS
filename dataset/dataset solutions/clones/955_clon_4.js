let connectionQueue = [];

function addConnection(connectionDetails) {
    connectionQueue.push(connectionDetails);
}

function retrieveMinConnection() {
    if (connectionQueue.length === 0) {
        return undefined;
    }

    let minimumWeight = Infinity;
    let minimumIndex = 0;

    for (let currentIdx = 0; currentIdx < connectionQueue.length; currentIdx++) {
        if (connectionQueue[currentIdx][1] < minimumWeight) {
            minimumWeight = connectionQueue[currentIdx][1];
            minimumIndex = currentIdx;
        }
    }

    const extractedConnection = connectionQueue[minimumIndex];
    connectionQueue[minimumIndex] = connectionQueue[connectionQueue.length - 1];
    connectionQueue.pop();

    return extractedConnection;
}

function processGraphData(inputData) {
    const lines = inputData.split("\n");
    const nodeCount = parseInt(lines[0], 10);

    const adjacencyList = Array.from({ length: nodeCount }, () => []);

    for (let rowIdx = 0; rowIdx < nodeCount; rowIdx++) {
        const rowValues = lines[rowIdx + 1].split(" ").map(Number);
        for (let colIdx = 0; colIdx < nodeCount; colIdx++) {
            const edgeWeight = rowValues[colIdx + 1];
            if (edgeWeight > -1) {
                adjacencyList[rowIdx].push({ destination: colIdx, weight: edgeWeight });
            }
        }
    }

    const mstMatrix = Array.from({ length: nodeCount }, () => Array(nodeCount).fill(-1));

    const visitedSet = new Set();
    let visitedNodeCount = 0;

    visitedSet.add(0);
    visitedNodeCount++;

    adjacencyList[0].forEach(connection => {
        addConnection([connection.destination, connection.weight, 0]);
    });

    while (visitedNodeCount < nodeCount) {
        const selectedConnection = retrieveMinConnection();

        if (!selectedConnection) {
            break;
        }

        const [targetNode, edgeWeight, sourceNode] = selectedConnection;

        if (visitedSet.has(targetNode)) {
            continue;
        }

        visitedSet.add(targetNode);
        visitedNodeCount++;

        mstMatrix[targetNode][sourceNode] = mstMatrix[sourceNode][targetNode] = edgeWeight;

        adjacencyList[targetNode].forEach(neighborConnection => {
            if (!visitedSet.has(neighborConnection.destination)) {
                addConnection([neighborConnection.destination, neighborConnection.weight, targetNode]);
            }
        });
    }

    const totalMstWeight = mstMatrix.reduce((accumulator, row, rowIdx) => {
        return accumulator + row.reduce((rowAccumulator, weight, colIdx) => {
            return (rowIdx < colIdx && weight > -1) ? rowAccumulator + weight : rowAccumulator;
        }, 0);
    }, 0);

    console.log(totalMstWeight);
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
