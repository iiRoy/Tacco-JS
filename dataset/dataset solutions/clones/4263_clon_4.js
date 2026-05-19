const inputBuffer = [];
const ioHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioHandler.on('line', (currentLine) => {
    inputBuffer.push(currentLine);
});

ioHandler.on('close', () => {
    const nodeCount = Number(inputBuffer[0]);

    const graphEdges = Array(nodeCount).fill(null).map(() => []);

    for (let currentIdx = 0; currentIdx < nodeCount; currentIdx++) {
        graphEdges[currentIdx].push({ target: (currentIdx + 1) % nodeCount, weight: 1 });
        graphEdges[currentIdx].push({ target: (currentIdx * 10) % nodeCount, weight: 0 });
    }

    const sourceNode = 1;
    const destinationNode = 0;

    const distanceMap = Array(nodeCount).fill(Infinity);
    const explorationQueue = [];

    distanceMap[sourceNode] = 0;
    explorationQueue.unshift(sourceNode);

    while (explorationQueue.length > 0) {
        const currentNode = explorationQueue.shift();

        for (const neighborInfo of graphEdges[currentNode]) {
            const targetNode = neighborInfo.target;
            const edgeWeight = neighborInfo.weight;

            if (distanceMap[currentNode] + edgeWeight < distanceMap[targetNode]) {
                distanceMap[targetNode] = distanceMap[currentNode] + edgeWeight;
                if (edgeWeight === 0) {
                    explorationQueue.unshift(targetNode);
                } else {
                    explorationQueue.push(targetNode);
                }
            }
        }
    }

    const minPathLength = distanceMap[destinationNode];
    console.log(minPathLength + 1);
});
