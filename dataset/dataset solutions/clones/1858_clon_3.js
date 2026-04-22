// This script processes graph data from standard input to determine reachability from node 1
// and, if all nodes are reachable, constructs a Breadth-First Search (BFS) tree.

// Acquire all raw input data from stdin, interpreting it as UTF-8 text.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

// Self-executing anonymous function to encapsulate the main logic.
((fullContent) => {
    // Split the entire input content into individual lines.
    const inputLines = fullContent.trim().split('\n'); // Added .trim() for robustness

    // Extract the first line which contains the total number of nodes and edges.
    const [nodeCountStr, edgeCountStr] = inputLines[0].split(' ');

    // Convert string values to numbers. Using Number() for variation from parseInt().
    const totalNodes = Number(nodeCountStr);
    const totalEdges = Number(edgeCountStr);

    // --- Input Validation (Type III addition) ---
    // Ensure that node and edge counts are valid positive integers.
    if (isNaN(totalNodes) || totalNodes <= 0 || isNaN(totalEdges) || totalEdges < 0) {
        console.error("Error: Invalid number of nodes or edges provided.");
        return; // Exit if input is invalid
    }
    // Also, if there's only one node and zero edges, it's a valid connected graph.
    if (totalNodes === 1 && totalEdges === 0) {
        console.log("Yes\n"); // Node 1 is connected to itself. No parents to print for other nodes.
        return;
    }
    // If more than one node but zero edges, it's not connected (unless N=1).
    if (totalNodes > 1 && totalEdges === 0) {
        console.log("No");
        return;
    }
    // End of Validation

    // Array to store the parsed edges. Each edge will be an object { start: u, end: v }.
    const edgeCollection = [];
    // Populate the edge list from the second line onwards.
    // Start loop from 1 (second line) up to totalEdges.
    for (let currentEdgeIndex = 0; currentEdgeIndex < totalEdges; ++currentEdgeIndex) {
        const [nodeUStr, nodeVStr] = inputLines[currentEdgeIndex + 1].split(' ');
        const nodeU = Number(nodeUStr);
        const nodeV = Number(nodeVStr);

        // --- Edge Validation (Type III addition) ---
        if (isNaN(nodeU) || isNaN(nodeV) || nodeU < 1 || nodeU > totalNodes || nodeV < 1 || nodeV > totalNodes) {
            console.error(`Error: Invalid edge definition on line ${currentEdgeIndex + 2}: ${nodeUStr} ${nodeVStr}`);
            return;
        }
        // Store edge as an object for clarity.
        edgeCollection.push({ start: nodeU, end: nodeV });
    }

    // Initialize an adjacency list representation for the graph.
    // Each index 'i' (from 1 to totalNodes) will contain an array of its neighbors.
    // Using Array.from for a slight variation in initialization.
    const adjacencyGraph = Array.from({ length: totalNodes + 1 }, () => []);

    // Build the adjacency list from the parsed edge list.
    // This graph is undirected, so add connections in both directions.
    for (const currentEdge of edgeCollection) {
        adjacencyGraph[currentEdge.start].push(currentEdge.end);
        adjacencyGraph[currentEdge.end].push(currentEdge.start);
    }

    // --- BFS Setup ---
    // `parentOfNode` will store the parent node in the BFS tree for each node.
    // Initialize with 0 to indicate unvisited/no parent for nodes 1 to totalNodes.
    // We care about parents for nodes 2 to totalNodes. Node 1 is the root, so its parent is undefined/0.
    const parentOfNode = new Array(totalNodes + 1).fill(0); // 0-indexed, but using 1-indexed nodes, so size N+1.
                                                          // parentOfNode[k] stores parent of node k.

    // `visitedStatus` array to explicitly track visited nodes (Type III addition for clarity).
    const visitedStatus = new Array(totalNodes + 1).fill(false);

    // BFS queue, starting with node 1.
    const bfsTraversalQueue = [1];
    visitedStatus[1] = true; // Mark the starting node as visited.
    let reachableNodeCount = 1; // Start with 1 as node 1 is initially reachable.

    // Perform Breadth-First Search.
    // The original code had a redundant loop here: `for (var i = 0; i < M; i++) { if (!A[i]) break; ... }`
    // This loop was unnecessary and has been removed as a Type III change.
    while (bfsTraversalQueue.length > 0) {
        // Dequeue the current node to process.
        const processingNode = bfsTraversalQueue.shift();

        // Iterate over all neighbors of the current node.
        for (const adjacentNode of adjacencyGraph[processingNode]) {
            // If the neighbor has not been visited yet.
            if (!visitedStatus[adjacentNode]) {
                visitedStatus[adjacentNode] = true; // Mark as visited.
                parentOfNode[adjacentNode] = processingNode; // Record the parent.
                bfsTraversalQueue.push(adjacentNode); // Enqueue for further exploration.
                reachableNodeCount++; // Increment count of reachable nodes.
            }
        }
    }

    // --- Output Decision ---
    // Check if all nodes (from 1 to totalNodes) were reached during the BFS.
    // If `reachableNodeCount` is equal to `totalNodes`, then the graph is connected from node 1.
    if (reachableNodeCount === totalNodes) {
        console.log('Yes');
        // Print the parent of each node from 2 to totalNodes.
        // Original code printed res[k-1] for k=1..N-1, which effectively means parent of node k+1.
        // Here, parentOfNode[k] stores parent of node k.
        const resultParents = [];
        for (let nodeIdx = 2; nodeIdx <= totalNodes; ++nodeIdx) {
            resultParents.push(parentOfNode[nodeIdx]);
        }
        // Use join for printing to avoid multiple console.log calls (Type III variation).
        console.log(resultParents.join('\n'));
    } else {
        // If not all nodes were reached, the graph is not connected from node 1.
        console.log('No');
    }

})(rawInputData); // Pass the raw input data to the immediately invoked function expression.