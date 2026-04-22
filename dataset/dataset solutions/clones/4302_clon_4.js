function solveProblem(rawData) {
    const lines = rawData.split('\n');
    const firstLineTokens = lines[0].split(' ').map(Number);
    const vertexCount = firstLineTokens[0];
    const linkCount = firstLineTokens[1];

    const connectionRegistry = []; 

    for (let k = 1; k <= linkCount; k++) {
        const connectionEndpoints = lines[k].split(' ').map(Number);
        const endpoint1 = connectionEndpoints[0];
        const endpoint2 = connectionEndpoints[1];
        connectionRegistry.push({ p: endpoint1, q: endpoint2, id: k });
    }

    let isolatedSegments = 0;

    for (let k = 1; k <= linkCount; k++) {
        const reachableVertexCount = evaluateReachability(vertexCount, connectionRegistry, k);
        
        if (reachableVertexCount < vertexCount) {
            isolatedSegments++;
        }
    }

    console.log(isolatedSegments);
}

function evaluateReachability(totalVertices, allConnections, excludedConnectionId) {
    const discoveredVertices = new Set();

    function traverseGraph(currentVertex) {
        discoveredVertices.add(currentVertex);

        for (const connection of allConnections) {
            if (connection.id === excludedConnectionId) {
                continue;
            }

            let nextVertex = -1;
            if (connection.p === currentVertex) {
                nextVertex = connection.q;
            } else if (connection.q === currentVertex) {
                nextVertex = connection.p;
            }

            if (nextVertex !== -1 && !discoveredVertices.has(nextVertex)) {
                traverseGraph(nextVertex);
            }
        }
    }

    traverseGraph(1);

    return discoveredVertices.size;
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8").trim());