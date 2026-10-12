var log = console.log;
if (typeof process != "undefined") {
    var input = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
        input += chunk;
    });
    process.stdin.on('end', function () {
        var lines = input.split("\n");
        mainClone(lines);
    });
}

function mainClone(inputLines) {
    const outputCollector = [];
    const printLine = (message) => outputCollector.push(message);

    // Replicate the original's specific input line processing behavior
    let processedInput = [...inputLines];
    const finalLine = processedInput.pop();
    if (finalLine !== "") {
        processedInput.push(undefined);
    }

    const numericalData = processedInput.map(entry => {
        if (entry === undefined) return undefined;
        return entry.split(" ").map(Number);
    });

    const [vertexQuantity, edgeQuantity] = numericalData.shift(); // V, E

    // Data structures for graph and DFS state
    const graphConnections = new Map(); // Adjacency list: Map<number, Set<number>>
    for (let i = 0; i < vertexQuantity; i++) {
        graphConnections.set(i, new Set());
    }

    const nodeState = new Array(vertexQuantity).fill(null).map(() => ({
        visited: false,
        discoveryOrder: -1,
        lowestReachable: -1,
    }));

    const discoveredBridges = new Map(); // Stores bridges: Map<number, number[]>

    // Store original edges to iterate for bridge identification later
    const initialEdgeList = [];

    // Populate graph connections
    numericalData.forEach(edgePair => {
        if (edgePair === undefined) return; // Skip if undefined was added by input processing
        const [nodeA, nodeB] = edgePair;
        graphConnections.get(nodeA).add(nodeB);
        graphConnections.get(nodeB).add(nodeA);
        initialEdgeList.push([nodeA, nodeB]);
    });

    let timeMarker = 0; // Counter for discovery order

    // Iterative Depth-First Search for bridge finding
    // Stack frame: { currentVertex: number, parentVertex: number, neighborIterator: Iterator<number>, processingStage: 'pre_visit' | 'post_children' }
    const traversalStack = [];

    // Start DFS from vertex 0 as per original
    traversalStack.push({
        currentVertex: 0,
        parentVertex: -1, // Sentinel for root's parent
        neighborIterator: graphConnections.get(0).values(),
        processingStage: 'pre_visit'
    });

    while (traversalStack.length > 0) {
        const currentFrame = traversalStack[traversalStack.length - 1]; // Peek at top frame
        const { currentVertex: u, parentVertex: p, neighborIterator, processingStage } = currentFrame;

        if (processingStage === 'pre_visit') {
            // Initial visit logic for 'u'
            nodeState[u].visited = true;
            nodeState[u].discoveryOrder = timeMarker;
            nodeState[u].lowestReachable = timeMarker;
            timeMarker++;
            currentFrame.processingStage = 'post_children'; // Transition to next stage
        } else { // processingStage === 'post_children'
            // Logic after initial visit, iterating neighbors and processing children
            let nextNeighborResult = neighborIterator.next();

            if (!nextNeighborResult.done) {
                const v = nextNeighborResult.value;

                if (v === p) {
                    // Skip the edge leading back to the immediate parent
                    continue; // Continue to the next neighbor in the current frame
                }

                if (!nodeState[v].visited) {
                    // 'v' is unvisited: this is a tree edge (u, v)
                    // Replicate original's try...catch: if dfs(target) throws, it's called again.
                    // Since the original dfs doesn't throw, this is effectively a single call.
                    traversalStack.push({
                        currentVertex: v,
                        parentVertex: u,
                        neighborIterator: graphConnections.get(v).values(),
                        processingStage: 'pre_visit'
                    });
                    // Pause current frame's neighbor iteration to process child 'v'
                    continue; // Continue to the next iteration of the main while loop, which will process the newly pushed frame for 'v'
                } else {
                    // 'v' is visited and not the parent: this is a back-edge (u, v)
                    nodeState[u].lowestReachable = Math.min(nodeState[u].lowestReachable, nodeState[v].discoveryOrder);
                    continue; // Continue to the next neighbor in the current frame
                }
            } else {
                // All neighbors for 'u' have been processed. 'u' and its subtree are fully explored.
                traversalStack.pop(); // Pop 'u' from stack

                // If 'u' has a parent (i.e., not the root of the DFS tree)
                // and there's a parent frame on the stack, update parent's lowLink.
                if (p !== -1 && traversalStack.length > 0) {
                    const parentOfU = traversalStack[traversalStack.length - 1].currentVertex;
                    nodeState[parentOfU].lowestReachable = Math.min(nodeState[parentOfU].lowestReachable, nodeState[u].lowestReachable);
                }
            }
        }
    }

    // Identify bridges using discovery and low-link values
    initialEdgeList.forEach(edge => {
        let node1 = edge[0];
        let node2 = edge[1];

        // Ensure node1 has a smaller discovery order than node2 for the bridge condition check
        if (nodeState[node1].discoveryOrder > nodeState[node2].discoveryOrder) {
            [node1, node2] = [node2, node1]; // Swap
        }

        // Bridge condition: if discovery order of node1 is less than low-link of node2
        if (nodeState[node1].discoveryOrder < nodeState[node2].lowestReachable) {
            const smallerNode = Math.min(edge[0], edge[1]);
            const largerNode = Math.max(edge[0], edge[1]);
            if (!discoveredBridges.has(smallerNode)) {
                discoveredBridges.set(smallerNode, []);
            }
            discoveredBridges.get(smallerNode).push(largerNode);
        }
    });

    // Output bridges in the specified format
    for (let i = 0; i < vertexQuantity; i++) {
        if (discoveredBridges.has(i)) {
            const bridgesFromNode = discoveredBridges.get(i);
            // Sort in descending order as per original's b<a comparison
            bridgesFromNode.sort((a, b) => b - a);
            bridgesFromNode.forEach(connectedNode => {
                printLine(`${i} ${connectedNode}`);
            });
        }
    }

    // Output collected lines
    if (typeof process === "undefined") {
        return outputCollector.join("\n");
    } else {
        outputCollector.forEach(line => console.log(line));
    }
}
