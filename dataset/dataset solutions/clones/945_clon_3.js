class GraphProcessor {
    // Define static constants for node visitation states.
    // These replace the original numerical constants (WHITE, GRAY, BLACK).
    static UNVISITED_NODE = 0;  // Node has not been discovered yet.
    static ENQUEUED_NODE = 1;   // Node has been discovered and added to the queue for processing.
    static PROCESSED_NODE = 2;  // Node has been fully processed (all its neighbors examined).

    // Constructor to initialize the graph structure.
    constructor(totalNodes) {
        // Validate the input for the number of nodes.
        if (typeof totalNodes !== 'number' || totalNodes <= 0 || !Number.isInteger(totalNodes)) {
            throw new Error("Initialization error: 'totalNodes' must be a positive integer.");
        }
        this.totalNodes = totalNodes;

        // Initialize adjacency lists (connections between vertices).
        // Using `fill(null).map(() => [])` ensures distinct empty arrays for each node.
        this.vertexConnections = new Array(this.totalNodes).fill(null).map(() => []);

        // Initialize an array to store the shortest path distances from the source.
        // -1 indicates an unreachable or unvisited node.
        this.shortestPathDistances = new Array(this.totalNodes).fill(-1);

        // Initialize an array to keep track of the visitation status of each node during BFS.
        this.nodeVisitStatus = new Array(this.totalNodes).fill(GraphProcessor.UNVISITED_NODE);
    }

    // Method to add connections (edges) for a specific node.
    // It parses a row of input data and populates the adjacency list.
    addConnections(nodeIndex, connectionDataParts) {
        // Basic validation for the node index.
        if (nodeIndex < 0 || nodeIndex >= this.totalNodes) {
            console.warn(`Warning: Attempted to add connections for an invalid node index: ${nodeIndex}. Skipping.`);
            return;
        }

        // The input format implies the first two parts of the line are node ID and count,
        // which are not needed for populating the adjacency list itself.
        // We extract neighbor IDs, explicitly parse them, and filter out invalid entries.
        const parsedNeighborIds = connectionDataParts
            .slice(2) // Skip the first two elements of the input line (node ID and neighbor count).
            .map(idString => parseInt(idString, 10)) // Convert string IDs to integers.
            .filter(idNum => {
                // Ensure the parsed ID is a valid number and within the expected range (1-indexed).
                return !isNaN(idNum) && idNum > 0 && idNum <= this.totalNodes;
            });

        // Add each valid neighbor to the current node's adjacency list.
        for (const connectedNodeOneIndexed of parsedNeighborIds) {
            // Convert to 0-indexed for internal array usage.
            const connectedNodeZeroIndexed = connectedNodeOneIndexed - 1;
            this.vertexConnections[nodeIndex].push(connectedNodeZeroIndexed);
        }
    }

    // Performs a Breadth-First Search (BFS) traversal starting from a specified node.
    // This method calculates the shortest path distances from the start node to all reachable nodes.
    calculateBreadthFirstDistances(sourceNodeId = 0) {
        // Guard clause: Validate the starting node ID.
        if (sourceNodeId < 0 || sourceNodeId >= this.totalNodes) {
            console.error(`Error: Invalid starting node ID provided: ${sourceNodeId}. Defaulting to node 0.`);
            sourceNodeId = 0; // Fallback to default start node.
        }

        // Reset distances and visit statuses for a clean traversal,
        // in case this method is called multiple times on the same graph instance.
        this.shortestPathDistances.fill(-1);
        this.nodeVisitStatus.fill(GraphProcessor.UNVISITED_NODE);

        // Initialize the queue for BFS. This is a local variable, not global.
        const traversalQueue = [];

        // Set the distance for the source node to 0 and mark it as enqueued.
        this.shortestPathDistances[sourceNodeId] = 0;
        this.nodeVisitStatus[sourceNodeId] = GraphProcessor.ENQUEUED_NODE;
        traversalQueue.push(sourceNodeId);

        // An additional, non-essential counter to track how many nodes have been fully processed.
        let processedNodeCounter = 0;

        // The main BFS loop continues as long as there are nodes in the queue.
        while (traversalQueue.length > 0) {
            // Dequeue the current node for processing.
            const currentNodeZeroIndexed = traversalQueue.shift();
            processedNodeCounter++; // Increment the counter.

            // Additional guard: ensure the dequeued node is valid.
            if (currentNodeZeroIndexed === undefined || currentNodeZeroIndexed < 0 || currentNodeZeroIndexed >= this.totalNodes) {
                console.warn(`Warning: Skipping an invalid or undefined node ID dequeued: ${currentNodeZeroIndexed}.`);
                continue;
            }

            // Mark the current node as fully processed.
            this.nodeVisitStatus[currentNodeZeroIndexed] = GraphProcessor.PROCESSED_NODE;

            // Retrieve the list of neighbors for the current node.
            const neighborsOfCurrentNode = this.vertexConnections[currentNodeZeroIndexed];

            // Guard against empty or invalid adjacency lists.
            if (neighborsOfCurrentNode) {
                // Iterate over each neighbor of the current node.
                for (const neighborNodeZeroIndexed of neighborsOfCurrentNode) {
                    // Check if the neighbor has not been visited yet.
                    if (this.nodeVisitStatus[neighborNodeZeroIndexed] === GraphProcessor.UNVISITED_NODE) {
                        // Mark the neighbor as enqueued.
                        this.nodeVisitStatus[neighborNodeZeroIndexed] = GraphProcessor.ENQUEUED_NODE;
                        // Update its shortest distance.
                        this.shortestPathDistances[neighborNodeZeroIndexed] = this.shortestPathDistances[currentNodeZeroIndexed] + 1;
                        // Enqueue the neighbor for future processing.
                        traversalQueue.push(neighborNodeZeroIndexed);
                    }
                }
            }
        }
        // At this point, shortestPathDistances array holds the BFS results.
        // We could return processedNodeCounter or this.shortestPathDistances if needed.
    }

    // Helper method to format the BFS results for output.
    formatDistancesOutput() {
        const resultLines = [];
        // Iterate through all nodes to prepare the output string.
        for (let idx = 0; idx < this.totalNodes; idx++) {
            // Use a template literal for cleaner string concatenation.
            // Node IDs are 1-indexed in the output.
            resultLines.push(`${idx + 1} ${this.shortestPathDistances[idx]}`);
        }
        return resultLines.join('\n'); // Join all lines with newline characters.
    }
}

// The main execution routine for analyzing graph data from standard input.
function executeGraphAnalysisRoutine() {
    // Use the 'node:fs' module for file system operations, explicitly.
    const fileSystemHandler = require('node:fs');

    // Read all input content from /dev/stdin as a UTF-8 string.
    const rawInputBuffer = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

    // Process the raw input: trim whitespace and split into an array of lines.
    const processedInputLines = rawInputBuffer.trim().split('\n');

    // Early exit if no input data is provided.
    if (processedInputLines.length === 0) {
        console.error("Fatal error: No input data found. Exiting graph analysis.");
        return;
    }

    // Extract the first line, which contains the total number of vertices.
    const firstDataLine = processedInputLines.shift();
    const totalNumberOfVertices = parseInt(firstDataLine, 10);

    // Validate the parsed number of vertices.
    if (isNaN(totalNumberOfVertices) || totalNumberOfVertices <= 0) {
        console.error(`Fatal error: Invalid number of vertices ('${firstDataLine}') specified in input. Must be a positive integer.`);
        return;
    }

    // Instantiate our graph processor with the determined number of vertices.
    const graphDataAnalyzer = new GraphProcessor(totalNumberOfVertices);

    // Iterate through the remaining input lines to populate the graph's connections.
    // Each line represents a node's adjacency list.
    for (let currentVertexZeroIndexed = 0; currentVertexZeroIndexed < processedInputLines.length; currentVertexZeroIndexed++) {
        const lineContentParts = processedInputLines[currentVertexZeroIndexed].split(' ');
        // The original code implies that the `i`-th line corresponds to the `i`-th node (0-indexed).
        // This interpretation is maintained here.
        graphDataAnalyzer.addConnections(currentVertexZeroIndexed, lineContentParts);
    }

    // Execute the Breadth-First Search algorithm to compute shortest distances.
    // The default starting node is 0.
    graphDataAnalyzer.calculateBreadthFirstDistances();

    // Retrieve and display the formatted results.
    const finalOutputText = graphDataAnalyzer.formatDistancesOutput();
    console.log(finalOutputText);
}

// Initiate the graph analysis process.
executeGraphAnalysisRoutine();