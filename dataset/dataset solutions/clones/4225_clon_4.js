const computeMinPathMatrix = (initialGraph) => {
    const distanceMap = Array.from(initialGraph, (row) => [...row]);

    const graphSize = distanceMap.length;

    for (let kNode = 0; kNode < graphSize; ++kNode) {
        for (let iNode = 0; iNode < graphSize; ++iNode) {
            for (let jNode = 0; jNode < graphSize; ++jNode) {
                const candidatePath = distanceMap[iNode][kNode] + distanceMap[kNode][jNode];
                if (distanceMap[iNode][jNode] > candidatePath) {
                    distanceMap[iNode][jNode] = candidatePath;
                }
            }
        }
    }

    return distanceMap;
};

const executePathCostCalculation = () => {
    const fileSystem = require("fs");

    const sourceLines = fileSystem.readFileSync("/dev/stdin", "UTF-8").split("\n");

    const [entityCount, segmentCount] = sourceLines[0].split(" ").map(Number);

    const initialAdjacency = sourceLines.slice(1, 11).map((line) =>
        line.split(" ").map(Number)
    );

    const finalPathCosts = computeMinPathMatrix(initialAdjacency);

    const cumulativeExpense = sourceLines.slice(11, 11 + entityCount)
        .reduce((runningSum, currentPathLine) => {
            const pathIndices = currentPathLine.split(" ").map(Number);
            return runningSum + pathIndices.reduce((segmentSum, vertexIndex) => {
                return segmentSum + (vertexIndex !== -1 ? finalPathCosts[vertexIndex][1] : 0);
            }, 0);
        }, 0);

    console.log(cumulativeExpense);
};

executePathCostCalculation();
