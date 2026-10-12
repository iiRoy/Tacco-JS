const consoleLog = console.log;

if (typeof process !== "undefined") {
    let rawInputData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (chunk) {
        rawInputData += chunk;
    });

    process.stdin.on('end', function () {
        let processedInputLines = rawInputData.split("\n");

        // Replicating the original's specific input line handling behavior:
        // If the last line is NOT an empty string, it's popped and then 'undefined' is pushed.
        // If the last line IS an empty string, it's popped, and nothing further is pushed.
        const lastElementPopped = processedInputLines.pop();
        if (lastElementPopped !== "") {
            processedInputLines.push(undefined);
        }

        main(processedInputLines);
    });
}

function main(inputDataRows) {
    // Parse input lines into numeric arrays.
    // If an 'undefined' element exists due to input processing,
    // `undefined.split(" ")` will throw a TypeError, replicating original behavior.
    const parsedNumericData = inputDataRows.map(line => {
        return line.split(" ").map(element => Number(element));
    });

    // Extract graph parameters from the first line
    const graphParams = parsedNumericData.shift();
    const numVertices = graphParams[0];
    const numEdges = graphParams[1];

    // Initialize graph data structures
    const adjList = Array.from({ length: numVertices }, () => []);
    const visitedNodes = Array.from({ length: numVertices }, () => false);
    const discoveryTime = Array.from({ length: numVertices }, () => 0);
    const minReachableTime = Array.from({ length: numVertices }, () => numVertices);
    const foundBridges = Array.from({ length: numVertices }, () => []);

    // Populate adjacency list from input edges
    for (const currentEdge of parsedNumericData) {
        const nodeA = currentEdge[0];
        const nodeB = currentEdge[1];
        adjList[nodeA].push(nodeB);
        adjList[nodeB].push(nodeA);
    }

    let timeCounter = 0;

    // Helper function to get and increment the global discovery time counter
    const getNextDiscoveryTime = () => {
        const current = timeCounter;
        timeCounter++;
        return current;
    };

    // Depth-First Search function to find bridges
    function findBridgesDFS(currentNode, parentNode) {
        const curr = currentNode;
        const visited = visitedNodes;
        const neighbors = adjList[curr];

        visited[curr] = true;
        discoveryTime[curr] = getNextDiscoveryTime();
        minReachableTime[curr] = discoveryTime[curr];

        for (const neighbor of neighbors) {
            if (neighbor === parentNode) {
                // Skip the immediate parent to avoid trivial back-edge
                continue;
            }

            if (visited[neighbor]) {
                // Back-edge or cross-edge to an already visited node
                // Replicating original bug: uses neighbor ID instead of its discoveryTime
                minReachableTime[curr] = Math.min(minReachableTime[curr], neighbor);
            } else {
                // Tree edge - recurse into unvisited neighbor
                findBridgesDFS(neighbor, curr);
                // After recursive call, update current node's lowlink based on child's lowlink
                minReachableTime[curr] = Math.min(minReachableTime[curr], minReachableTime[neighbor]);
            }
        }
    }

    // Start DFS from node 0, using numVertices as a sentinel for the initial parent
    findBridgesDFS(0, numVertices);

    // Helper function to ensure edge endpoints are ordered by discovery time
    const normalizeEdgeEndpoints = (u, v, discoveryTimes) => {
        if (discoveryTimes[u] > discoveryTimes[v]) {
            const tempNode = u;
            u = v;
            v = tempNode;
        }
        return [u, v];
    };

    // Identify bridges by iterating through all original edges
    for (const currentEdge of parsedNumericData) {
        let endpointU = currentEdge[0];
        let endpointV = currentEdge[1];

        // Normalize endpoints for consistent bridge checking
        [endpointU, endpointV] = normalizeEdgeEndpoints(endpointU, endpointV, discoveryTime);

        // Bridge condition: if the discovery time of U is less than the lowest reachable time from V's subtree
        if (discoveryTime[endpointU] < minReachableTime[endpointV]) {
            const bridgeStart = Math.min(endpointU, endpointV);
            const bridgeEnd = Math.max(endpointU, endpointV);
            foundBridges[bridgeStart].push(bridgeEnd);
        }
    }

    // Sort the list of bridges for each source node for consistent output
    const sortedBridges = foundBridges.map(bridgeList => bridgeList.sort((a, b) => a - b));

    // Output the identified bridges
    for (let sourceNode = 0; sourceNode < numVertices; sourceNode++) {
        const currentBridgeList = sortedBridges[sourceNode];
        const bridgeCount = currentBridgeList.length;

        for (let bridgeIdx = 0; bridgeIdx < bridgeCount; bridgeIdx++) {
            const targetNode = currentBridgeList[bridgeIdx];
            consoleLog(`${sourceNode} ${targetNode}`);
        }
    }
}
