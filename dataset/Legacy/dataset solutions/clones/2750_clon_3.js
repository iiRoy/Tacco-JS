function processGraphData(rawInputString) {
    const inputLines = rawInputString.trim().split('\n');

    const [nodeCountStr, edgeCountStr] = inputLines[0].split(' ');
    const nodeCount = parseInt(nodeCountStr, 10);
    const edgeCount = parseInt(edgeCountStr, 10);

    const graphAdjacencyMap = new Map();
    for (let nodeIdentifier = 1; nodeIdentifier <= nodeCount; nodeIdentifier++) {
        graphAdjacencyMap.set(nodeIdentifier, []);
    }

    const edgeDataLines = inputLines.slice(1); 
    for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
        const [firstNodeStr, secondNodeStr] = edgeDataLines[edgeIndex].split(' ');
        const nodeA = parseInt(firstNodeStr, 10);
        const nodeB = parseInt(secondNodeStr, 10);

        graphAdjacencyMap.get(nodeA).push(nodeB);
        graphAdjacencyMap.get(nodeB).push(nodeA);
    }

    for (const neighborsList of graphAdjacencyMap.values()) {
        if (neighborsList.length % 2 !== 0) {
            console.log("-1");
            return;
        }
    }
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
