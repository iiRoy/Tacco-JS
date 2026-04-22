const processGraphData = (rawDataLines) => {
    // Define a constant for an extremely small negative number.
    // This value represents an unreachable node or an infinitely small path length
    // in the context of finding the *longest* path.
    const UNREACHABLE_NODE_MARKER = Number.MIN_SAFE_INTEGER;

    // A utility function to parse a line of space-separated numeric values into an array of numbers.
    const parseNumericLine = (lineContent) => {
        return lineContent.split(" ").map(Number);
    };

    // --- Initial Input Processing ---
    // The first line of input typically contains the total number of vertices (N) and edges (M).
    const [numVertices, numEdges] = parseNumericLine(rawDataLines[0]);

    // Basic validation for the graph dimensions. While competitive programming inputs
    // are usually guaranteed valid, this demonstrates a Type III addition.
    if (numVertices <= 0 || numEdges < 0) {
        console.error("Input error: Number of vertices must be positive, and number of edges non-negative.");
        return;
    }

    // --- Graph Structure and Path Lengths Initialization ---
    // Initialize the adjacency list for the directed graph.
    // Each element `adjacencyList[i]` will be an array of `[targetVertex, edgeWeight]` pairs
    // representing edges originating from vertex `i`.
    const adjacencyList = Array.from({ length: numVertices }, () => []);

    // Initialize an array to store the maximum path lengths from the source vertex (vertex 0).
    // All path lengths are initially set to `UNREACHABLE_NODE_MARKER`, indicating no path found yet.
    const maxPathLengths = Array.from({ length: numVertices }, () => UNREACHABLE_NODE_MARKER);

    // The path length from the source vertex (vertex 0) to itself is 0.
    maxPathLengths[0] = 0;

    // --- Populate Graph Edges ---
    // Iterate through the subsequent input lines to add edges to the graph.
    // Each line describes an edge: `startNode endNode edgeWeight`.
    for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
        const edgeDetails = parseNumericLine(rawDataLines[1 + edgeIndex]);
        // Convert 1-indexed input to 0-indexed for array access.
        const startNode = edgeDetails[0] - 1;
        const endNode = edgeDetails[1] - 1;
        const edgeWeight = edgeDetails[2];

        // Add the edge to the adjacency list.
        adjacencyList[startNode].push([endNode, edgeWeight]);
    }

    // --- Bellman-Ford Algorithm: Core Path Relaxation (N-1 Iterations) ---
    // Perform `numVertices - 1` iterations. In each iteration, we attempt to relax all edges.
    // After `N-1` iterations, if no positive cycles are present, `maxPathLengths` will
    // contain the longest path from the source to all reachable nodes.
    for (let iterationCount = 0; iterationCount < numVertices - 1; iterationCount++) {
        // Iterate over all possible source vertices in the graph.
        for (let currentSourceVertex = 0; currentSourceVertex < numVertices; currentSourceVertex++) {
            // If the current source vertex is unreachable, it cannot extend any paths.
            if (maxPathLengths[currentSourceVertex] === UNREACHABLE_NODE_MARKER) {
                continue;
            }

            // Iterate through all outgoing edges from the `currentSourceVertex`.
            for (const [targetVertex, weightValue] of adjacencyList[currentSourceVertex]) {
                const potentialNewPathLength = maxPathLengths[currentSourceVertex] + weightValue;

                // If a longer path to the `targetVertex` is discovered, update its path length.
                if (maxPathLengths[targetVertex] < potentialNewPathLength) {
                    maxPathLengths[targetVertex] = potentialNewPathLength;
                }
            }
        }
    }

    // --- Bellman-Ford Algorithm: Positive Cycle Detection (N-th Iteration) ---
    // After the `N-1` path relaxation iterations, perform one additional iteration.
    // If any path length can still be improved in this N-th pass, it signifies
    // the existence of at least one positive cycle in the graph.
    let anyPathImprovedInCycleCheck = false;
    // This array tracks which nodes are part of, or reachable from, a positive cycle.
    const nodesAffectedByPositiveCycle = Array(numVertices).fill(false);

    // Iterate through all vertices and their edges one last time.
    for (let currentSourceVertex = 0; currentSourceVertex < numVertices; currentSourceVertex++) {
        // Only consider reachable source vertices.
        if (maxPathLengths[currentSourceVertex] === UNREACHABLE_NODE_MARKER) {
            continue;
        }

        for (const [targetVertex, weightValue] of adjacencyList[currentSourceVertex]) {
            const potentialNewPathLength = maxPathLengths[currentSourceVertex] + weightValue;

            // If a path can still be improved, it means a positive cycle is involved.
            if (maxPathLengths[targetVertex] < potentialNewPathLength) {
                // Update the path length to reflect the infinite growth (though it won't be truly infinite).
                maxPathLengths[targetVertex] = potentialNewPathLength;
                anyPathImprovedInCycleCheck = true; // Mark that a cycle was detected.
                nodesAffectedByPositiveCycle[targetVertex] = true; // Mark this node as affected.
            }
        }
    }

    // --- Propagate Positive Cycle Influence (Type III Addition) ---
    // If a positive cycle was detected, we need to determine all nodes whose longest paths
    // can become infinitely large because they are part of, or reachable from, such a cycle.
    if (anyPathImprovedInCycleCheck) {
        // Perform additional iterations to ensure the "positive infinity" effect propagates
        // to all reachable nodes from any node identified as being in a cycle.
        // Running `numVertices` more iterations ensures full propagation.
        for (let propagationIteration = 0; propagationIteration < numVertices; propagationIteration++) {
            for (let currentSourceVertex = 0; currentSourceVertex < numVertices; currentSourceVertex++) {
                // Only consider source vertices that are either currently reachable or already marked as affected by a cycle.
                if (maxPathLengths[currentSourceVertex] === UNREACHABLE_NODE_MARKER && !nodesAffectedByPositiveCycle[currentSourceVertex]) {
                    continue;
                }

                for (const [targetVertex, weightValue] of adjacencyList[currentSourceVertex]) {
                    const potentialNewPathLength = maxPathLengths[currentSourceVertex] + weightValue;

                    // If the target node's path can still be improved, or if its source is already affected by a cycle,
                    // then the target node also becomes affected.
                    if (maxPathLengths[targetVertex] < potentialNewPathLength || nodesAffectedByPositiveCycle[currentSourceVertex]) {
                        nodesAffectedByPositiveCycle[targetVertex] = true;
                        // Continue updating distance to reflect the 'growing' path, or simply rely on the boolean flag.
                        maxPathLengths[targetVertex] = potentialNewPathLength;
                    }
                }
            }
        }
    }

    // --- Final Output ---
    // The problem typically asks for the longest path to the last vertex (N-1).
    const finalTargetVertexIndex = numVertices - 1;

    // If the target vertex is affected by a positive cycle, its longest path is infinite.
    if (nodesAffectedByPositiveCycle[finalTargetVertexIndex]) {
        console.log("POSITIVE_INFINITY"); // More descriptive output than generic "inf"
    }
    // If the target vertex was never reached from the source.
    else if (maxPathLengths[finalTargetVertexIndex] === UNREACHABLE_NODE_MARKER) {
        console.log("UNREACHABLE_NODE"); // Clearer than just a numeric "inf" or very low number
    }
    // Otherwise, output the calculated longest path length.
    else {
        console.log(maxPathLengths[finalTargetVertexIndex]);
    }
};

// --- Execution Entry Point (IIFE for scope isolation and error handling) ---
// This block reads input from standard input (e.g., a file or console pipe)
// and passes it to the main processing function.
(function() {
    try {
        // Read all file content from /dev/stdin (common for competitive programming on Linux/macOS).
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        // Split content into lines and filter out any empty lines.
        const inputLines = fileContent.split("\n").filter(line => line.trim() !== "");
        // Call the main graph processing function.
        processGraphData(inputLines);
    } catch (error) {
        // Enhanced error handling for Type III.
        console.error("An error occurred during input reading or graph processing:", error.message);
        // Optionally, print stack trace in development.
        // console.error(error.stack);
    }
})();