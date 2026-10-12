function calculateIndependentRegions(vertexAmount, connections) {
    const neighborTable = Array.from(
        { length: vertexAmount },
        () => []
    );

    for (const [leftVertex, rightVertex] of connections) {
        neighborTable[leftVertex].push(rightVertex);
        neighborTable[rightVertex].push(leftVertex);
    }

    const exploredVertices = new Set();
    let regionAmount = 0;

    for (
        let startingVertex = 0;
        startingVertex < vertexAmount;
        startingVertex++
    ) {
        if (exploredVertices.has(startingVertex)) {
            continue;
        }

        regionAmount++;

        const traversalStack = [startingVertex];
        exploredVertices.add(startingVertex);

        while (traversalStack.length > 0) {
            const inspectedVertex = traversalStack.pop();
            const adjacentVertices =
                neighborTable[inspectedVertex];

            for (const adjacentVertex of adjacentVertices) {
                if (exploredVertices.has(adjacentVertex)) {
                    continue;
                }

                exploredVertices.add(adjacentVertex);
                traversalStack.push(adjacentVertex);
            }
        }
    }

    return regionAmount;
}