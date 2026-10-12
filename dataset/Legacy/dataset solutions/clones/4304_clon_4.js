process.stdin.resume();
process.stdin.setEncoding('utf8');
let rawInputBuffer = '';

process.stdin.on('data', function (chunk) {
    rawInputBuffer += chunk;
});

const parseNumericLine = (lineContent) =>
    lineContent.trim().split(" ").map(Number);

process.stdin.on('end', function () {
    const inputLines = rawInputBuffer.split('\n');

    const graphDimensions = parseNumericLine(inputLines[0]);
    const nodeCount = graphDimensions[0];
    const edgeCount = graphDimensions[1];

    let currentEdgeSet = new Set();
    const rawEdgeData = inputLines.slice(1, 1 + edgeCount).map(parseNumericLine);

    const adjacencyList = Array.from({ length: nodeCount }, () => []);

    rawEdgeData.forEach(edgePair => {
        const u = edgePair[0] - 1;
        const v = edgePair[1] - 1;

        adjacencyList[u].push(v);
        adjacencyList[v].push(u);

        currentEdgeSet.add(`${Math.min(u, v)},${Math.max(u, v)}`);
    });

    let detectedCycles = [];

    for (let startNodeIdx = 0; startNodeIdx < nodeCount; ++startNodeIdx) {
        const pathTraversalNodes = new Set();
        const exploredNodesInCurrentSearch = new Set();

        exploredNodesInCurrentSearch.add(startNodeIdx);

        const findPathsRecursive = (currentNodeIdx, currentPath) => {
            for (const neighborNodeIdx of adjacencyList[currentNodeIdx]) {
                if (neighborNodeIdx === startNodeIdx && currentPath.length >= 2) {
                    detectedCycles.push([...currentPath, neighborNodeIdx]);
                } else if (!pathTraversalNodes.has(neighborNodeIdx) && !exploredNodesInCurrentSearch.has(neighborNodeIdx)) {
                    pathTraversalNodes.add(neighborNodeIdx);
                    exploredNodesInCurrentSearch.add(neighborNodeIdx);

                    findPathsRecursive(neighborNodeIdx, [...currentPath, neighborNodeIdx]);

                    pathTraversalNodes.delete(neighborNodeIdx);
                }
            }
        };

        for (const initialNeighbor of adjacencyList[startNodeIdx]) {
            if (!pathTraversalNodes.has(initialNeighbor) && !exploredNodesInCurrentSearch.has(initialNeighbor)) {
                pathTraversalNodes.add(initialNeighbor);
                exploredNodesInCurrentSearch.add(initialNeighbor);
                findPathsRecursive(initialNeighbor, [startNodeIdx, initialNeighbor]);
                pathTraversalNodes.delete(initialNeighbor);
            }
        }
    }

    detectedCycles = detectedCycles.filter(path => path.length > 2);

    for (const cyclePath of detectedCycles) {
        // Replicating the original code's bug:
        // The loop `for(let i=0;i<l.length;++l)` in the original code
        // increments the array `l` itself, causing it to become NaN.
        // This results in the loop running only for `i=0`.
        // Thus, only the first edge of each cycle (l[0], l[1]) is considered for removal.
        const u = cyclePath[0];
        const v = cyclePath[1];

        currentEdgeSet.delete(`${Math.min(u, v)},${Math.max(u, v)}`);
    }

    console.log(currentEdgeSet.size);
});
