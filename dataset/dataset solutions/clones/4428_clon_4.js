const fileSystem = require('fs');

module.exports = function(inputLines) {
    const nodeCount = parseInt(inputLines[0], 10);
    const adjacencyStructure = Array.from({ length: nodeCount }, () => []);

    const [queryCount, initialNodeIndex] = inputLines[nodeCount]
        .split(" ")
        .map(segment => parseInt(segment, 10));

    const zeroBasedInitialNode = initialNodeIndex - 1;

    for (let edgeIterator = 0; edgeIterator < nodeCount - 1; ++edgeIterator) {
        const [firstVertex, secondVertex, edgeWeightValue] = inputLines[edgeIterator + 1]
            .split(" ")
            .map(segment => parseInt(segment, 10));

        const zeroBasedFirst = firstVertex - 1;
        const zeroBasedSecond = secondVertex - 1;

        if (zeroBasedSecond !== zeroBasedInitialNode) {
            adjacencyStructure[zeroBasedFirst].push({ connectedTo: zeroBasedSecond, cost: edgeWeightValue });
        }
        if (zeroBasedFirst !== zeroBasedInitialNode) {
            adjacencyStructure[zeroBasedSecond].push({ connectedTo: zeroBasedFirst, cost: edgeWeightValue });
        }
    }

    const pathCosts = new Array(nodeCount).fill(-1);
    const processingQueue = [];

    pathCosts[zeroBasedInitialNode] = 0;
    processingQueue.push(zeroBasedInitialNode);

    let queueHead = 0;
    while (queueHead < processingQueue.length) {
        const currentVertex = processingQueue[queueHead++];
        const currentPathCost = pathCosts[currentVertex];

        for (const connection of adjacencyStructure[currentVertex]) {
            const nextVertex = connection.connectedTo;
            const traversalCost = connection.cost;

            if (pathCosts[nextVertex] === -1) {
                pathCosts[nextVertex] = currentPathCost + traversalCost;
                processingQueue.push(nextVertex);
            }
        }
    }

    for (let queryIterator = 0; queryIterator < queryCount; ++queryIterator) {
        const [targetA, targetB] = inputLines[queryIterator + nodeCount + 1]
            .split(" ")
            .map(segment => parseInt(segment, 10));

        const totalQueryCost = pathCosts[targetA - 1] + pathCosts[targetB - 1];
        console.log(totalQueryCost);
    }
};

if (require.main === module) {
    const rawData = fileSystem.readFileSync("/dev/stdin", "UTF-8");
    const dataLines = rawData.split("\n");
    module.exports(dataLines);
}
