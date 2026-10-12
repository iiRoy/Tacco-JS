var printOutput = console.log;

if (typeof process != "undefined") {
    var rawInputData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
        rawInputData += chunk;
    });
    process.stdin.on('end', function () {
        processGraphData(rawInputData);
    });
}

function* generateParsedLines(textPayload) {
    const textRows = textPayload.split("\n");
    if (textRows.length > 0) {
        const finalRowContent = textRows.pop();
        if (finalRowContent !== "") {
            textRows.push(undefined);
        }
    }

    for (const row of textRows) {
        if (row === undefined) {
            yield undefined;
            continue;
        }
        yield row.split(" ").map(Number);
    }
}

function processGraphData(inputString) {
    const lineGenerator = generateParsedLines(inputString);

    const graphConfig = lineGenerator.next().value;
    const nodeCount = graphConfig[0];

    const adjacencyMap = new Map();
    for (let i = 0; i < nodeCount; i++) {
        adjacencyMap.set(i, new Set());
    }

    for (const edgePair of lineGenerator) {
        const nodeA = edgePair[0];
        const nodeB = edgePair[1];
        adjacencyMap.get(nodeA).add(nodeB);
        adjacencyMap.get(nodeB).add(nodeA);
    }

    const bridgeResults = findGraphBridgesIterative(nodeCount, adjacencyMap);
    formatAndOutputBridges(nodeCount, bridgeResults);
}

function findGraphBridgesIterative(totalNodes, graphAdjacency) {
    const discoveryTime = new Map();
    const minReachableTime = new Map();
    const visitedNodes = new Set();
    let timeTracker = 0;
    const detectedBridges = new Set();

    const dfsTraversalStack = [];

    for (let currentStartNode = 0; currentStartNode < totalNodes; currentStartNode++) {
        if (!visitedNodes.has(currentStartNode)) {
            dfsTraversalStack.push([currentStartNode, -1, graphAdjacency.get(currentStartNode).values()]);

            while (dfsTraversalStack.length > 0) {
                let [currentNode, parentNode, neighborIterator] = dfsTraversalStack[dfsTraversalStack.length - 1];

                if (!visitedNodes.has(currentNode)) {
                    visitedNodes.add(currentNode);
                    discoveryTime.set(currentNode, timeTracker);
                    minReachableTime.set(currentNode, timeTracker);
                    timeTracker++;
                }

                let nextNeighborResult = neighborIterator.next();
                if (!nextNeighborResult.done) {
                    const neighborNode = nextNeighborResult.value;

                    if (neighborNode === parentNode) {
                        continue;
                    }

                    if (!visitedNodes.has(neighborNode)) {
                        dfsTraversalStack.push([neighborNode, currentNode, graphAdjacency.get(neighborNode).values()]);
                    } else {
                        minReachableTime.set(currentNode, Math.min(minReachableTime.get(currentNode), discoveryTime.get(neighborNode)));
                    }
                } else {
                    dfsTraversalStack.pop();

                    if (parentNode !== -1) {
                        minReachableTime.set(parentNode, Math.min(minReachableTime.get(parentNode), minReachableTime.get(currentNode)));
                        if (discoveryTime.get(parentNode) < minReachableTime.get(currentNode)) {
                            const smallerNode = Math.min(parentNode, currentNode);
                            const largerNode = Math.max(parentNode, currentNode);
                            detectedBridges.add(`${smallerNode}-${largerNode}`);
                        }
                    }
                }
            }
        }
    }
    return detectedBridges;
}

function formatAndOutputBridges(totalNodes, bridgeSet) {
    const bridgeMappingForOutput = new Map();

    for (const bridgeString of bridgeSet) {
        const [u, v] = bridgeString.split('-').map(Number);
        if (!bridgeMappingForOutput.has(u)) {
            bridgeMappingForOutput.set(u, []);
        }
        bridgeMappingForOutput.get(u).push(v);
    }

    for (let sourceNode = 0; sourceNode < totalNodes; sourceNode++) {
        if (bridgeMappingForOutput.has(sourceNode)) {
            const targetNodes = bridgeMappingForOutput.get(sourceNode);
            targetNodes.sort((a, b) => b - a);
            for (const targetNode of targetNodes) {
                printOutput(`${sourceNode} ${targetNode}`);
            }
        }
    }
}
