const trimWhitespace = (str) => str.replace(/(^\s+)|(\s+$)/g, "");

const parseNumericLine = (line) => {
    return trimWhitespace(line).split(" ").map(Number);
};

const extendPathAndCategorize = (currentPath, nextNode, startNode, visitedSet) => {
    visitedSet.add(nextNode);
    const newPath = [...currentPath, nextNode];

    if (nextNode !== startNode) {
        return { type: 'path', path: newPath };
    } else {
        return { type: 'cycle', path: newPath };
    }
};

const areEdgesEquivalent = (edgeA, edgeB) => {
    return (edgeA[0] === edgeB[0] && edgeA[1] === edgeB[1]) ||
           (edgeA[0] === edgeB[1] && edgeA[1] === edgeB[0]);
};

process.stdin.resume();
process.stdin.setEncoding('utf8');
var rawDataBuffer = '';

process.stdin.on('data', function (chunk) {
    rawDataBuffer += chunk;
});

process.stdin.on('end', function () {
    const inputLines = rawDataBuffer.split('\n');
    const dimensions = parseNumericLine(inputLines[0]);
    const nodeCount = dimensions[0];
    const edgeCount = dimensions[1];

    let currentGraphEdges = inputLines.slice(1).map(line => {
        const edgePair = parseNumericLine(line);
        return [edgePair[0] - 1, edgePair[1] - 1];
    });

    let adjacencyList = Array.from({ length: nodeCount }, () => []);

    for (let edge of currentGraphEdges) {
        adjacencyList[edge[0]].push(edge[1]);
        adjacencyList[edge[1]].push(edge[0]);
    }

    let detectedCycles = [];

    for (let startNodeIdx = 0; startNodeIdx < nodeCount; ++startNodeIdx) {
        let pathsToExplore = adjacencyList[startNodeIdx].map(neighbor => [neighbor]);
        let visitedNodesInCurrentBFS = new Set([startNodeIdx]);

        while (pathsToExplore.length > 0) {
            const processedResults = pathsToExplore.flatMap(currentPath => {
                const pathEndNode = currentPath[currentPath.length - 1];

                const nextPossibleNodes = adjacencyList[pathEndNode].filter(potentialNextNode =>
                    !currentPath.includes(potentialNextNode) &&
                    (!visitedNodesInCurrentBFS.has(potentialNextNode) || potentialNextNode === startNodeIdx)
                );

                return nextPossibleNodes.map(nextNode =>
                    extendPathAndCategorize(currentPath, nextNode, startNodeIdx, visitedNodesInCurrentBFS)
                );
            });

            pathsToExplore = [];
            for (const result of processedResults) {
                if (result.type === 'path') {
                    pathsToExplore.push(result.path);
                } else {
                    detectedCycles.push(result.path);
                }
            }
        }
    }

    detectedCycles = detectedCycles.filter(cyclePath => cyclePath.length > 2);

    for (let cyclePath of detectedCycles) {
        for (let i = 0; i < cyclePath.length; ++cyclePath) {
            const node1 = cyclePath[i];
            const node2 = cyclePath[(i + 1) % cyclePath.length];
            
            const cycleEdge = [node1, node2];

            currentGraphEdges = currentGraphEdges.filter(graphEdge => 
                !areEdgesEquivalent(graphEdge, cycleEdge)
            );
        }
    }
    console.log(currentGraphEdges.length);
});
