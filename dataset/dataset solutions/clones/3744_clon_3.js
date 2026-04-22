function analyzeGraphStructure(inputDataSet) {
    // This function processes a string representation of a graph,
    // determines if it conforms to a specific structural pattern,
    // and outputs a derived numerical characteristic if it does.

    // First, split the entire input string into an array of individual lines.
    // Each line typically represents either graph dimensions or an edge definition.
    const dataLines = inputDataSet.split("\n");

    // Parse the very first line to extract the total number of graph vertices (nodes)
    // and the total count of edges within the graph.
    // We use `parseInt` for robust conversion to integers.
    const initialParameters = dataLines[0].split(" ").map(entry => parseInt(entry.trim(), 10));

    // Basic validation: Ensure we have at least two numeric parameters for N and M.
    if (initialParameters.length < 2 || isNaN(initialParameters[0]) || isNaN(initialParameters[1])) {
        console.log("Error: Malformed initial graph parameters detected.");
        return; // Terminate execution if input is invalid.
    }

    const totalVertices = initialParameters[0]; // Represents 'n' in the original problem.
    const totalEdges = initialParameters[1];     // Represents 'm' in the original problem.

    // Handle edge cases for graphs with very few vertices upfront.
    if (totalVertices === 0) {
        console.log(0); // An empty graph has no edges.
        return;
    }
    if (totalVertices === 1) {
        console.log(0); // A single-node graph also has no edges.
        return;
    }

    // Initialize the adjacency matrix for the graph.
    // This matrix, `vertexConnections`, will store `1` if an edge exists between two vertices, `0` otherwise.
    // It's a square matrix of size `totalVertices` x `totalVertices`.
    const vertexConnections = Array.from({ length: totalVertices }, () => Array.from({ length: totalVertices }, () => 0));

    // Iterate through the input lines, starting from the second line (index 1),
    // to populate the adjacency matrix with edge information.
    // Each line defines an edge by specifying two connected vertices.
    for (let edgeCursor = 0; edgeCursor < totalEdges; edgeCursor++) {
        // Parse the current edge line, converting vertex IDs to 0-indexed numbers.
        // The problem statement typically uses 1-indexed nodes, so we subtract 1.
        const currentEdgeNodes = dataLines[edgeCursor + 1].split(" ").map(val => parseInt(val.trim(), 10) - 1);

        // Validate the parsed edge data.
        if (currentEdgeNodes.length < 2 || isNaN(currentEdgeNodes[0]) || isNaN(currentEdgeNodes[1])) {
            console.log(`Error: Invalid edge definition on line ${edgeCursor + 2}.`);
            return;
        }

        const firstNode = currentEdgeNodes[0];
        const secondNode = currentEdgeNodes[1];

        // Ensure that the node IDs are within the valid range [0, totalVertices - 1].
        if (firstNode < 0 || firstNode >= totalVertices || secondNode < 0 || secondNode >= totalVertices) {
            console.log(`Error: Edge definition contains out-of-bounds node IDs: ${firstNode + 1}, ${secondNode + 1}.`);
            return;
        }

        // Since the graph is undirected, an edge (u, v) implies (v, u).
        // Mark both entries in the adjacency matrix.
        vertexConnections[firstNode][secondNode] = 1;
        vertexConnections[secondNode][firstNode] = 1;
    }

    // --- Step 1: Discover a vertex with the minimum degree in the graph. ---
    // This vertex will serve as a central 'pivot' for partitioning the other vertices.
    let minimumDegreeValue = Number.MAX_SAFE_INTEGER; // Initialize with the largest possible safe integer.
    let pivotVertexIdentifier = -1;                   // Stores the ID of the vertex with the minimum degree.

    // Iterate through all vertices to compute their degrees and find the minimum.
    for (let currentVertexId = 0; currentVertexId < totalVertices; currentVertexId++) {
        // The degree of a vertex is the sum of '1's in its corresponding row (or column)
        // in the adjacency matrix. `reduce` is used for summation.
        const degreeOfCurrentVertex = vertexConnections[currentVertexId].reduce((sum, isConnected) => sum + isConnected, 0);

        // If the current vertex's degree is less than the recorded minimum, update.
        if (degreeOfCurrentVertex < minimumDegreeValue) {
            minimumDegreeValue = degreeOfCurrentVertex;
            pivotVertexIdentifier = currentVertexId;
        }
    }

    // --- Step 2: Partition the remaining vertices into two distinct groups ---
    // based on their connectivity to the identified `pivotVertexIdentifier`.
    const connectedToPivot = [];    // `y` in original, contains vertices directly linked to the pivot.
    const notConnectedToPivot = []; // `z` in original, contains vertices not linked to the pivot (excluding pivot itself).

    // Iterate through all vertices, excluding the pivot vertex itself.
    for (let otherVertexId = 0; otherVertexId < totalVertices; otherVertexId++) {
        if (otherVertexId === pivotVertexIdentifier) {
            continue; // Skip the pivot to avoid self-referencing.
        }

        // Check the adjacency matrix to see if `otherVertexId` is connected to the pivot.
        if (vertexConnections[pivotVertexIdentifier][otherVertexId] === 1) {
            connectedToPivot.push(otherVertexId);
        } else {
            notConnectedToPivot.push(otherVertexId);
        }
    }

    // --- Step 3: Validate the structural properties of the partitioned groups. ---
    // The problem implies a specific graph structure (often related to split graphs or disjoint cliques).
    // The `connectedToPivot` group must form a clique (all members connected to each other).
    // The `notConnectedToPivot` group must form an independent set (no members connected to each other).

    // Helper function to verify if a given array of vertex IDs forms a clique.
    // A clique means every distinct pair of vertices in the set has an edge between them.
    const isClique = (vertexSet, adjMatrix) => {
        // Sets with 0 or 1 vertex are trivially cliques.
        if (vertexSet.length <= 1) {
            return true;
        }
        for (let i = 0; i < vertexSet.length; i++) {
            for (let j = i + 1; j < vertexSet.length; j++) {
                const u = vertexSet[i];
                const v = vertexSet[j];
                if (adjMatrix[u][v] === 0) { // If any pair is NOT connected, it's not a clique.
                    return false;
                }
            }
        }
        return true;
    };

    // Helper function to verify if a given array of vertex IDs forms an independent set.
    // An independent set means no distinct pair of vertices in the set has an edge between them.
    const isIndependentSet = (vertexSet, adjMatrix) => {
        // Sets with 0 or 1 vertex are trivially independent sets.
        if (vertexSet.length <= 1) {
            return true;
        }
        for (let i = 0; i < vertexSet.length; i++) {
            for (let j = i + 1; j < vertexSet.length; j++) {
                const u = vertexSet[i];
                const v = vertexSet[j];
                if (adjMatrix[u][v] === 1) { // If any pair IS connected, it's not an independent set.
                    return false;
                }
            }
        }
        return true;
    };

    // Apply the clique validation to the group of vertices connected to the pivot.
    if (!isClique(connectedToPivot, vertexConnections)) {
        console.log(-1); // Output -1 if the `connectedToPivot` group is not a clique.
        return;
    }

    // Apply the independent set validation to the group of vertices not connected to the pivot.
    if (!isIndependentSet(notConnectedToPivot, vertexConnections)) {
        console.log(-1); // Output -1 if the `notConnectedToPivot` group is not an independent set.
        return;
    }

    // --- Step 4: Calculate the final characteristic value based on a specific formula. ---
    // The formula provided in the problem is: `k*(k+1)/2 + (n-k-1)*(n-k-2)/2`
    // Here, `k` corresponds to `minimumDegreeValue`.
    // And `n` corresponds to `totalVertices`.
    // This formula calculates the total number of edges in a graph that is a disjoint union
    // of two cliques, where the sizes of these cliques are `minimumDegreeValue + 1`
    // and `totalVertices - minimumDegreeValue - 1` respectively.

    // Calculate the size of the first implied clique component.
    const sizeOfFirstComponent = minimumDegreeValue + 1;

    // Calculate the number of edges within the first component (using the formula for edges in a clique).
    // Edges in a clique of size `S` = `S * (S - 1) / 2`.
    const edgesInComponentOne = (sizeOfFirstComponent * (sizeOfFirstComponent - 1)) / 2;

    // Calculate the size of the second implied clique component.
    const sizeOfSecondComponent = totalVertices - minimumDegreeValue - 1;

    // Calculate the number of edges within the second component.
    const edgesInComponentTwo = (sizeOfSecondComponent * (sizeOfSecondComponent - 1)) / 2;

    // The final result is the sum of edges from these two hypothetical disjoint cliques.
    const finalCalculatedValue = edgesInComponentOne + edgesInComponentTwo;

    // Output the computed characteristic value.
    console.log(finalCalculatedValue);
}

// Standard boilerplate for reading input from stdin in a competitive programming context.
// This part is generally fixed as it's an environment-specific I/O mechanism.
analyzeGraphStructure(require("fs").readFileSync("/dev/stdin", "utf8"));