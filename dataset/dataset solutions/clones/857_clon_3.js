// A utility module for handling standard input operations, abstracting Node.js 'fs'
const systemIOHandler = {
    // Standard input file descriptor constant
    STDIN_FILE_HANDLE: 0, // In Node.js, process.stdin.fd is typically 0

    // Synchronously retrieves the size of a file descriptor
    fetchStreamSize: (fileDescriptor) => {
        try {
            return require('fs').fstatSync(fileDescriptor).size;
        } catch (error) {
            console.error(`Error acquiring stream size: ${error.message}`);
            return 0; // Indicate zero size on error
        }
    },

    // Synchronously reads data into a buffer from a given file descriptor
    readStreamData: (fileDescriptor, targetBuffer, bufferOffset, bytesToRead, filePosition) => {
        try {
            return require('fs').readSync(fileDescriptor, targetBuffer, bufferOffset, bytesToRead, filePosition);
        } catch (error) {
            console.error(`Error reading from input stream: ${error.message}`);
            return 0; // Indicate no bytes read on error
        }
    }
};

// Helper function to parse a string line into an array of integers
const convertLineToNumbers = (lineContent) => {
    // Validate input to prevent errors with non-string or empty lines
    if (typeof lineContent !== 'string' || lineContent.trim().length === 0) {
        return [];
    }
    return lineContent.split(/\s+/).map(str => parseInt(str.trim(), 10)).filter(num => !isNaN(num));
};

// The primary function to execute the graph path analysis
const executeGraphPathAnalysis = () => {
    // Determine the total byte size of the incoming standard input
    const totalInputBytes = systemIOHandler.fetchStreamSize(systemIOHandler.STDIN_FILE_HANDLE);

    // Guard clause: if no input is available, log a warning and exit
    if (totalInputBytes === 0) {
        console.warn("No data detected in standard input. Process terminated.");
        return;
    }

    // Allocate a buffer to store the raw input bytes
    const dataHoldingBuffer = Buffer.alloc(totalInputBytes);

    // Read the entire standard input stream into the buffer
    const bytesActuallyRead = systemIOHandler.readStreamData(
        systemIOHandler.STDIN_FILE_HANDLE,
        dataHoldingBuffer,
        0, // Start writing from the beginning of the buffer
        totalInputBytes, // Attempt to read up to the determined size
        0 // Start reading from the beginning of the input stream
    );

    // Convert the buffer's content into a UTF-8 string and split it into individual lines
    const incomingTextLines = dataHoldingBuffer.toString('utf8', 0, bytesActuallyRead).split('\n');

    // Ensure the first line, containing graph dimensions, is present and valid
    if (incomingTextLines.length === 0 || incomingTextLines[0].trim().length === 0) {
        console.error("Critical error: Graph dimension line (N, M) is missing or empty.");
        return;
    }

    // Parse the first line to extract the number of nodes (V) and edges (E)
    const graphDimensions = convertLineToNumbers(incomingTextLines.shift());
    if (graphDimensions.length < 2) {
        console.error("Input format error: Unable to parse node and edge counts from the first line.");
        return;
    }

    const numberOfVertices = graphDimensions[0]; // Corresponds to 'n'
    const numberOfConnections = graphDimensions[1]; // Corresponds to 'm'

    // Basic validation for graph parameters
    if (numberOfVertices <= 0 || numberOfConnections < 0) {
        console.error(`Invalid graph parameters: Vertices=${numberOfVertices}, Connections=${numberOfConnections}. Must have positive vertices and non-negative connections.`);
        return;
    }
    if (numberOfConnections > incomingTextLines.length) {
        console.warn(`Warning: Expected ${numberOfConnections} edge definitions but found only ${incomingTextLines.length} lines. Processing available connections.`);
    }

    // Initialize core data structures for graph representation and path calculations
    // `forwardAdjacency` stores outgoing edges for each vertex
    const forwardAdjacency = Array.from({ length: numberOfVertices }, () => []);
    // `backwardAdjacency` stores incoming edges (predecessors) for each vertex
    const backwardAdjacency = Array.from({ length: numberOfVertices }, () => []);
    // `longestPathCache` stores the maximum path length ending at each vertex
    const longestPathCache = Array(numberOfVertices).fill(0);
    // `allGraphEdges` stores details of each edge, including its original 1-based index
    const allGraphEdges = [];

    // Process each line representing an edge to build the graph's adjacency lists
    let currentEdgeCounter = 0;
    while (currentEdgeCounter < numberOfConnections && currentEdgeCounter < incomingTextLines.length) {
        const currentEdgeLine = incomingTextLines[currentEdgeCounter];
        const edgeEndpoints = convertLineToNumbers(currentEdgeLine);

        if (edgeEndpoints.length < 2) {
            console.warn(`Skipping malformed edge definition at line ${currentEdgeCounter + 2}: "${currentEdgeLine}"`);
            currentEdgeCounter++;
            continue;
        }

        // Adjust node identifiers to be 0-based for array indexing
        const originVertex = edgeEndpoints[0] - 1;
        const destinationVertex = edgeEndpoints[1] - 1;

        // Validate that node indices are within the defined graph boundaries
        if (originVertex < 0 || originVertex >= numberOfVertices || destinationVertex < 0 || destinationVertex >= numberOfVertices) {
            console.warn(`Skipping edge (${originVertex + 1}, ${destinationVertex + 1}) due to out-of-bounds vertex identifiers.`);
            currentEdgeCounter++;
            continue;
        }

        // Store the edge details, preserving its original 1-based index
        allGraphEdges.push({
            origin: originVertex,
            destination: destinationVertex,
            initialIndex: currentEdgeCounter + 1 // Store the 1-based index for output
        });

        // Populate the adjacency lists
        forwardAdjacency[originVertex].push(destinationVertex);
        backwardAdjacency[destinationVertex].push(originVertex);

        currentEdgeCounter++;
    }

    // --- Stage 1: Compute the longest path length to each vertex in the graph ---
    // This calculation assumes the graph is a Directed Acyclic Graph (DAG) for correctness.
    // In a general graph with cycles, this approach would not find true longest paths.
    for (let u = 0; u < numberOfVertices; u++) {
        // Iterate through all vertices reachable directly from 'u'
        for (const v of forwardAdjacency[u]) {
            const potentialLengthViaU = longestPathCache[u] + 1;
            // If traversing through 'u' provides a longer path to 'v', update 'v's path length
            if (longestPathCache[v] < potentialLengthViaU) {
                longestPathCache[v] = potentialLengthViaU;
            }
        }
    }

    // --- Stage 2: Identify vertices that lie on *any* overall longest path ---
    // First, find the maximum path length achieved across all vertices
    const overallMaxPathLength = longestPathCache.reduce((currentMax, pathLen) => Math.max(currentMax, pathLen), 0);

    // `isOnLongestPath` flags vertices that are part of at least one longest path
    const isOnLongestPath = Array(numberOfVertices).fill(false);
    // `levelContributionCounts` tracks how many critical longest paths pass through a specific 'level' (path length)
    const levelContributionCounts = Array(overallMaxPathLength + 1).fill(0); // Size is maxPath + 1 for 0-based indexing

    // Initialize `isOnLongestPath` for vertices that directly achieve the `overallMaxPathLength`
    for (let vIdx = 0; vIdx < numberOfVertices; vIdx++) {
        if (longestPathCache[vIdx] === overallMaxPathLength) {
            isOnLongestPath[vIdx] = true;
        }
    }

    // --- Stage 3: Reverse traversal to refine `isOnLongestPath` and populate `levelContributionCounts` ---
    // Iterate from the highest-indexed vertex downwards to ensure dependencies are met in DAGs
    for (let currentV = numberOfVertices - 1; currentV >= 0; currentV--) {
        // Only consider vertices already identified as being on a longest path
        if (isOnLongestPath[currentV]) {
            // Examine all predecessors of the current vertex
            for (const predecessorV of backwardAdjacency[currentV]) {
                // If the predecessor's path length + 1 equals the current vertex's path length,
                // it means this predecessor is also part of a longest path leading to `currentV`
                if (longestPathCache[predecessorV] + 1 === longestPathCache[currentV]) {
                    isOnLongestPath[predecessorV] = true;
                    // Increment the count for this specific path length level.
                    // This helps identify "unique" path segments.
                    levelContributionCounts[longestPathCache[predecessorV]]++;
                }
            }
        }
    }

    // --- Stage 4: Determine and output "critical" edges ---
    // An edge is considered critical if it meets specific criteria related to longest paths
    const identifiedCriticalEdges = [];
    for (const edgeData of allGraphEdges) {
        const edgeSource = edgeData.origin;
        const edgeTarget = edgeData.destination;
        const originalEdgeID = edgeData.initialIndex;

        // Condition 1: Both the source and target vertices must be part of *a* longest path
        const isSourceVertexCritical = isOnLongestPath[edgeSource];
        const isTargetVertexCritical = isOnLongestPath[edgeTarget];

        // Condition 2: The path length level of the source vertex must have a unique contribution (count of 1)
        // This suggests it's a bottleneck or a uniquely determining segment of a longest path
        const isSourceLevelUniquelyContributing = levelContributionCounts[longestPathCache[edgeSource]] === 1;

        if (isSourceVertexCritical && isTargetVertexCritical && isSourceLevelUniquelyContributing) {
            identifiedCriticalEdges.push(originalEdgeID);
        }
    }

    // Output the 1-based indices of all identified critical edges
    identifiedCriticalEdges.forEach(edgeIdentifier => console.log(edgeIdentifier));
};

// Invoke the main analysis routine to start execution
executeGraphPathAnalysis();