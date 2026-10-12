function countConnectedComponents(nodeCount, edges) {
    if (nodeCount === 0) {
        return 0;
    }

    const adjacencyList = [];

    for (let node = 0; node < nodeCount; node++) {
        adjacencyList.push([]);
    }

    for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
        const startingNode = edges[edgeIndex][0];
        const endingNode = edges[edgeIndex][1];

        adjacencyList[startingNode].push(endingNode);
        adjacencyList[endingNode].push(startingNode);
    }

    const visitedNodes =
        new Array(nodeCount).fill(false);

    let componentCount = 0;

    for (
        let initialNode = 0;
        initialNode < nodeCount;
        initialNode++
    ) {
        if (visitedNodes[initialNode]) {
            continue;
        }

        const pendingNodes = [initialNode];
        componentCount += 1;

        do {
            const currentNode = pendingNodes.pop();

            if (visitedNodes[currentNode]) {
                continue;
            }

            visitedNodes[currentNode] = true;

            for (
                let neighborIndex =
                    adjacencyList[currentNode].length - 1;
                neighborIndex >= 0;
                neighborIndex--
            ) {
                const neighbor =
                    adjacencyList[currentNode][neighborIndex];

                if (!visitedNodes[neighbor]) {
                    pendingNodes.push(neighbor);
                }
            }
        } while (pendingNodes.length !== 0);
    }

    return componentCount;
}