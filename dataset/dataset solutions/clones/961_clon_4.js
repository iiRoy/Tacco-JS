function calculateShortestRoute(sourceDataText) {
    const dataLines = sourceDataText.split("\n");
    const totalNodes = parseInt(dataLines[0], 10);

    const adjacencyList = new Map();
    for (let currentLineIndex = 0; currentLineIndex < totalNodes; currentLineIndex++) {
        const lineParts = dataLines[currentLineIndex + 1].split(" ").map(Number);
        const sourceNode = lineParts[0];
        const edgeCount = lineParts[1];
        const outgoingEdges = [];
        for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
            outgoingEdges.push({
                destination: lineParts[edgeIdx * 2 + 2],
                value: lineParts[edgeIdx * 2 + 3]
            });
        }
        adjacencyList.set(sourceNode, outgoingEdges);
    }

    const pathCosts = new Map();
    for (let nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
        pathCosts.set(nodeIndex, Number.MAX_SAFE_INTEGER);
    }
    pathCosts.set(0, 0);

    const pendingPaths = [];

    const registerPath = (nodeIdentifier, costValue) => {
        let isUpdated = false;
        for (let i = 0; i < pendingPaths.length; i++) {
            if (pendingPaths[i].node === nodeIdentifier) {
                if (costValue < pendingPaths[i].currentCost) {
                    pendingPaths[i].currentCost = costValue;
                }
                isUpdated = true;
                break;
            }
        }
        if (!isUpdated) {
            pendingPaths.push({ node: nodeIdentifier, currentCost: costValue });
        }
    };

    const retrieveMinimumPath = () => {
        if (pendingPaths.length === 0) {
            return null;
        }

        let lowestCost = Number.MAX_SAFE_INTEGER;
        let minElementIndex = -1;
        let selectedPath = null;

        for (let i = 0; i < pendingPaths.length; i++) {
            if (pendingPaths[i].currentCost < lowestCost) {
                lowestCost = pendingPaths[i].currentCost;
                minElementIndex = i;
                selectedPath = pendingPaths[i];
            }
        }

        if (minElementIndex !== -1) {
            pendingPaths.splice(minElementIndex, 1);
        }
        return selectedPath;
    };

    registerPath(0, 0);

    let finalizedNodeCount = 0;
    while (finalizedNodeCount < totalNodes) {
        const currentBestPath = retrieveMinimumPath();

        if (!currentBestPath) {
            break;
        }

        const activeNode = currentBestPath.node;
        const currentAccumulatedCost = currentBestPath.currentCost;

        if (currentAccumulatedCost > pathCosts.get(activeNode)) {
            continue;
        }

        finalizedNodeCount++;

        const connectedEdges = adjacencyList.get(activeNode) || [];
        for (const connectedEdge of connectedEdges) {
            const candidateCost = currentAccumulatedCost + connectedEdge.value;
            if (candidateCost < pathCosts.get(connectedEdge.destination)) {
                pathCosts.set(connectedEdge.destination, candidateCost);
                registerPath(connectedEdge.destination, candidateCost);
            }
        }
    }

    let results = [];
    for (let i = 0; i < totalNodes; i++) {
        results.push(`${i} ${pathCosts.get(i)}`);
    }
    console.log(results.join("\n"));
}

calculateShortestRoute(require("fs").readFileSync("/dev/stdin", "utf8"));