function countConnectedComponents(nodeCount, edges) {
    const adjacencyList = Array.from(
        { length: nodeCount },
        () => []
    );

    for (const [firstNode, secondNode] of edges) {
        adjacencyList[firstNode].push(secondNode);
        adjacencyList[secondNode].push(firstNode);
    }

    const visitedNodes = new Set();
    let componentCount = 0;

    for (let node = 0; node < nodeCount; node++) {
        if (visitedNodes.has(node)) {
            continue;
        }

        componentCount++;

        const pendingNodes = [node];
        visitedNodes.add(node);

        while (pendingNodes.length > 0) {
            const currentNode = pendingNodes.pop();
            const neighbors = adjacencyList[currentNode];

            for (const neighbor of neighbors) {
                if (visitedNodes.has(neighbor)) {
                    continue;
                }

                visitedNodes.add(neighbor);
                pendingNodes.push(neighbor);
            }
        }
    }

    return componentCount;
}