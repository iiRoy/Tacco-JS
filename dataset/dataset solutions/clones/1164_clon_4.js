const outputWriter = console.log;

if (typeof process !== "undefined") {
    let rawInput = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        rawInput += chunk;
    });
    process.stdin.on('end', () => {
        const inputLines = rawInput.split("\n");
        processInput(inputLines);
    });
}

function processInput(inputLines) {
    const filteredLines = inputLines.filter(line => line.trim() !== '');

    const parsedData = filteredLines.map(line => line.split(" ").map(Number));

    const [vertexCount, edgeCount] = parsedData.shift();
    const edgeDescriptions = parsedData;

    const adjacencyStructure = Array.from({ length: vertexCount }, () => []);

    edgeDescriptions.forEach(([nodeA, nodeB]) => {
        adjacencyStructure[nodeA].push(nodeB);
        adjacencyStructure[nodeB].push(nodeA);
    });

    const discoveryTimes = new Array(vertexCount).fill(-1);
    const lowestReachTimes = new Array(vertexCount).fill(-1);
    const visitedStatus = new Array(vertexCount).fill(false);
    let globalTime = 0;
    const foundBridges = [];

    const traversalStack = [];

    for (let startNode = 0; startNode < vertexCount; startNode++) {
        if (!visitedStatus[startNode]) {
            traversalStack.push([startNode, -1, 0]);

            while (traversalStack.length > 0) {
                let [currentNode, parentNode, state] = traversalStack.pop();

                if (state === 0) {
                    visitedStatus[currentNode] = true;
                    discoveryTimes[currentNode] = lowestReachTimes[currentNode] = globalTime++;
                    traversalStack.push([currentNode, parentNode, 1]);

                    for (let i = adjacencyStructure[currentNode].length - 1; i >= 0; i--) {
                        const neighbor = adjacencyStructure[currentNode][i];
                        if (neighbor === parentNode) {
                            continue;
                        }
                        if (visitedStatus[neighbor]) {
                            lowestReachTimes[currentNode] = Math.min(lowestReachTimes[currentNode], discoveryTimes[neighbor]);
                        } else {
                            traversalStack.push([neighbor, currentNode, 0]);
                        }
                    }
                } else {
                    if (parentNode !== -1) {
                        lowestReachTimes[parentNode] = Math.min(lowestReachTimes[parentNode], lowestReachTimes[currentNode]);
                        if (discoveryTimes[parentNode] < lowestReachTimes[currentNode]) {
                            foundBridges.push([Math.min(currentNode, parentNode), Math.max(currentNode, parentNode)]);
                        }
                    }
                }
            }
        }
    }

    foundBridges.sort((a, b) => {
        if (a[0] !== b[0]) {
            return a[0] - b[0];
        }
        return a[1] - b[1];
    });

    foundBridges.forEach(([u, v]) => {
        outputWriter(`${u} ${v}`);
    });
}
