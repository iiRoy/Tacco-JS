const processInput = (rawInput) => {
    const lines = rawInput.split('\n');
    const [nodeCount, edgeCount] = lines[0].split(' ').map(Number);

    const adjacencyStructure = new Map();
    for (let i = 1; i <= nodeCount; i++) {
        adjacencyStructure.set(i, new Set());
    }

    for (let i = 0; i < edgeCount; i++) {
        const [u, v] = lines[i + 1].split(' ').map(Number);
        adjacencyStructure.get(u).add(v);
        adjacencyStructure.get(v).add(u);
    }

    const parentRegistry = new Map();
    const discoveryQueue = [];
    const visitedTracker = new Set();

    discoveryQueue.push(1);
    visitedTracker.add(1);

    let queueIndex = 0;
    while (queueIndex < discoveryQueue.length) {
        const currentVertex = discoveryQueue[queueIndex++];
        const neighbors = adjacencyStructure.get(currentVertex);

        if (neighbors) {
            for (const connectedNode of neighbors) {
                if (!visitedTracker.has(connectedNode)) {
                    visitedTracker.add(connectedNode);
                    discoveryQueue.push(connectedNode);
                    if (connectedNode !== 1) {
                        parentRegistry.set(connectedNode, currentVertex);
                    }
                }
            }
        }
    }

    console.log('Yes');

    const resultParents = new Array(nodeCount - 1);
    for (let i = 2; i <= nodeCount; i++) {
        if (parentRegistry.has(i)) {
            resultParents[i - 2] = parentRegistry.get(i);
        } else {
            resultParents[i - 2] = undefined;
        }
    }

    resultParents.forEach(val => {
        if (val !== undefined) {
            console.log(val);
        }
    });
};

const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(inputData);
