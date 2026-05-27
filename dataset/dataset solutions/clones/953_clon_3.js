const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\n');

const findLightestEdge = (candidateEdges) => {
    if (candidateEdges.length === 0) {
        return null;
    }
    return candidateEdges.reduce((currentMin, edge) => {
        return (currentMin.edgeWeight > edge.edgeWeight) ? edge : currentMin;
    });
};

const calculateMinimumSpanningTree = (adjacencyList) => {
    const visitedNodes = [0];
    const mstEdges = [];
    const totalNodes = Object.keys(adjacencyList).length;

    while (visitedNodes.length < totalNodes) {
        let candidateEdges = [];

        for (const visitedNodeId of visitedNodes) {
            const neighbors = adjacencyList[visitedNodeId];
            if (neighbors) {
                const unvisitedNeighbors = neighbors.filter(neighborEdge => {
                    return !visitedNodes.includes(neighborEdge.targetNodeId);
                });
                candidateEdges.push(...unvisitedNeighbors);
            }
        }

        const minEdge = findLightestEdge(candidateEdges);

        visitedNodes.push(minEdge.targetNodeId);
        mstEdges.push(minEdge);
    }

    return mstEdges;
};

const INVALID_EDGE_WEIGHT = -1;

const parseGraphRow = (rowString, rowIndex) => {
    return rowString.trim().split(' ')
        .map((weightStr, colIndex) => {
            return { targetNodeId: colIndex, edgeWeight: Number(weightStr) };
        })
        .filter(edge => edge.edgeWeight !== INVALID_EDGE_WEIGHT);
};

const graphInputRows = inputLines.slice(1);

const parsedGraphData = {};
graphInputRows.forEach((row, index) => {
    parsedGraphData[index] = parseGraphRow(row, index);
});

const finalMSTEdges = calculateMinimumSpanningTree(parsedGraphData);
const totalMSTWeight = finalMSTEdges.reduce((accumulator, edge) => accumulator + edge.edgeWeight, 0);

console.log(totalMSTWeight);
