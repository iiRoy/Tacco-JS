var lines = [];
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (x) {
    lines.push(x);
});

rl.on('close', function () {
    var nodeCount = Number(lines[0]);
    lines.shift();

    // Preserve original 'uvw' variable name for the required console.log output.
    var uvw = lines.map(entry => entry.split(" ").map(Number));

    // Preserve original sorting and console.log behavior.
    uvw.sort((firstEdge, secondEdge) => {
        if (firstEdge[1] === secondEdge[1]) { return (firstEdge[0] - secondEdge[0]); }
        else { return (firstEdge[1] - secondEdge[1]); }
    });
    console.log(uvw);

    // Build an adjacency list for graph traversal.
    // Each element in graphAdjacency[i] is an object { connectedTo: j, weight: k }
    const graphAdjacency = Array.from({ length: nodeCount }, () => []);
    for (const [sourceNode, targetNode, edgeWeight] of uvw) {
        // Adjust to 0-indexed node representation
        graphAdjacency[sourceNode - 1].push({ connectedTo: targetNode - 1, weight: edgeWeight });
        graphAdjacency[targetNode - 1].push({ connectedTo: sourceNode - 1, weight: edgeWeight });
    }

    // Initialize an array to store the final colors of each node.
    // null indicates an uncolored node.
    const finalColors = new Array(nodeCount).fill(null);
    finalColors[0] = 0; // Node 0 (which corresponds to original node 1) is colored white (0).

    // Use a queue for Breadth-First Search (BFS) to traverse and color the graph.
    const processingQueue = [];
    processingQueue.push(0); // Start BFS from node 0.

    let queuePointer = 0; // Manual pointer for queue to avoid performance overhead of Array.shift()
    while (queuePointer < processingQueue.length) {
        const currentVertexIndex = processingQueue[queuePointer++];
        const currentVertexColor = finalColors[currentVertexIndex];

        // Iterate over all connections from the current vertex.
        for (const connection of graphAdjacency[currentVertexIndex]) {
            const adjacentVertexIndex = connection.connectedTo;
            const edgeValue = connection.weight;

            // If the adjacent vertex has not been colored yet.
            if (finalColors[adjacentVertexIndex] === null) {
                // Determine the color of the adjacent vertex:
                // If edge weight is even, the color is the same as the current vertex.
                // If edge weight is odd, the color is the opposite of the current vertex.
                // This can be expressed as (currentVertexColor + edgeValue) % 2.
                finalColors[adjacentVertexIndex] = (currentVertexColor + edgeValue) % 2;
                processingQueue.push(adjacentVertexIndex); // Add the newly colored vertex to the queue.
            }
        }
    }

    // Output the final color for each node.
    for (let i = 0; i < nodeCount; i++) {
        console.log(finalColors[i]);
    }
});
