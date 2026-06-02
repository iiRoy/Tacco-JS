const fileSystem = require('fs');

function processGraphData(inputContent) {
    const inputLines = inputContent.split('\n');

    const [vertexCount, modificationCount] = inputLines[0].split(' ').map(Number);

    const adjacencyStructure = Array.from({ length: vertexCount }, () => []);

    for (let i = 0; i < vertexCount - 1; i++) {
        const [firstNode, secondNode] = inputLines[i + 1].split(' ').map(s => Number(s) - 1);
        adjacencyStructure[firstNode].push(secondNode);
        adjacencyStructure[secondNode].push(firstNode);
    }

    const accumulatedValues = new Array(vertexCount).fill(0);

    for (let i = 0; i < modificationCount; i++) {
        const [targetIndex, incrementValue] = inputLines[i + vertexCount].split(' ').map(Number);
        accumulatedValues[targetIndex - 1] += incrementValue;
    }

    const bfsProcessingQueue = [0];
    const visitedNodesSet = new Set([0]);

    while (bfsProcessingQueue.length > 0) {
        const currentProcessingNode = bfsProcessingQueue.shift();

        adjacencyStructure[currentProcessingNode].forEach(adjacentNode => {
            if (!visitedNodesSet.has(adjacentNode)) {
                accumulatedValues[adjacentNode] += accumulatedValues[currentProcessingNode];
                visitedNodesSet.add(adjacentNode);
                bfsProcessingQueue.push(adjacentNode);
            }
        });
    }

    console.log(accumulatedValues.join(' '));
}

processGraphData(fileSystem.readFileSync("/dev/stdin", "UTF-8"));
