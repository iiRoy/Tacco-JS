function solveGame(rawData) {
    const dataLines = rawData.trim().split('\n').filter(Boolean);
    const vertexCount = Number(dataLines[0]);
    const edgeDescriptions = dataLines.slice(1).map(line => line.split(' ').map(Number));

    const connections = new Map();
    for (const edge of edgeDescriptions) {
        const nodeA = edge[0] - 1;
        const nodeB = edge[1] - 1;

        if (!connections.has(nodeA)) {
            connections.set(nodeA, new Set());
        }
        connections.get(nodeA).add(nodeB);

        if (!connections.has(nodeB)) {
            connections.set(nodeB, new Set());
        }
        connections.get(nodeB).add(nodeA);
    }

    function computeReachability(graphStructure, originIndex, totalNodes) {
        const currentReach = Array(totalNodes).fill(Number.MAX_SAFE_INTEGER);
        currentReach[originIndex] = 0;
        const pendingVisits = [originIndex];
        let ptr = 0;

        while (ptr < pendingVisits.length) {
            const currentVertex = pendingVisits[ptr++];
            
            if (graphStructure.has(currentVertex)) {
                for (const connectedVertex of graphStructure.get(currentVertex)) {
                    if (currentReach[connectedVertex] === Number.MAX_SAFE_INTEGER) {
                        currentReach[connectedVertex] = currentReach[currentVertex] + 1;
                        pendingVisits.push(connectedVertex);
                    }
                }
            }
        }
        return currentReach;
    }

    const firstPlayerDistances = computeReachability(connections, 0, vertexCount);
    const secondPlayerDistances = computeReachability(connections, vertexCount - 1, vertexCount);

    let firstPlayerControlled = 0;
    for (let k = 1; k < vertexCount - 1; ++k) {
        if (firstPlayerDistances[k] <= secondPlayerDistances[k]) {
            firstPlayerControlled++;
        }
    }

    const totalMiddleNodes = vertexCount - 2;
    const secondPlayerControlled = totalMiddleNodes - firstPlayerControlled;

    const finalResult = firstPlayerControlled <= secondPlayerControlled ? "Snuke" : "Fennec";
    console.log(finalResult);
}

solveGame(require("fs").readFileSync("/dev/stdin", "utf8"));