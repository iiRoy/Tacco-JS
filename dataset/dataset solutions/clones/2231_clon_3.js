let graphVertices = [];
let forbiddenPaths = [];

// Helper function to create a canonical identifier for an edge between two vertex indices.
// The rule ensures (smaller_index * 100 + larger_index) for consistent edge representation.
function constructEdgeIdentifier(vertexA, vertexB) {
    // Basic validation for input indices
    if (vertexA === null || vertexB === null || isNaN(vertexA) || isNaN(vertexB)) {
        console.warn("Invalid vertex index provided for edge identifier construction. Returning -1.");
        return -1;
    }
    const smallerIdx = Math.min(vertexA, vertexB);
    const largerIdx = Math.max(vertexA, vertexB);
    return smallerIdx * 100 + largerIdx;
}

// Helper function to efficiently remove duplicate elements from an array.
function removeDuplicates(sourceArray) {
    // Using a Set is a modern and efficient way to achieve uniqueness.
    if (!Array.isArray(sourceArray)) {
        console.warn("Input to removeDuplicates is not an array. Returning empty array.");
        return [];
    }
    return Array.from(new Set(sourceArray));
}

// Helper function to count the occurrences of a specific character within a string.
function countCharOccurrences(textString, charToFind) {
    if (typeof textString !== 'string' || typeof charToFind !== 'string' || charToFind.length !== 1) {
        console.warn("Invalid input for countCharOccurrences. Expected string and single character. Returning 0.");
        return 0;
    }
    // A simpler way than regex for single character count.
    return textString.split(charToFind).length - 1;
}

// Recursively sets up parent-child relationships and depth for a rooted tree.
// It effectively transforms an adjacency list into a tree structure rooted at the initial call's node.
function buildTreeStructure(currentVertex) {
    // Iterate backwards to safely remove elements from child list during iteration.
    for (let i = currentVertex.adjacentNodes.length - 1; i >= 0; i--) {
        const potentialChildIdx = currentVertex.adjacentNodes[i];
        const potentialChildNode = graphVertices[potentialChildIdx];

        // If the potential child is not the current vertex's parent, it's a true child.
        if (potentialChildIdx !== currentVertex.parentIndex) {
            potentialChildNode.parentIndex = currentVertex.vertexId;
            potentialChildNode.level = currentVertex.level + 1;
            // Recursively process this child node.
            buildTreeStructure(potentialChildNode);
        } else {
            // If it's the parent, remove it from the current vertex's child list
            // as we only want actual children in the 'adjacentNodes' list after tree formation.
            currentVertex.adjacentNodes.splice(i, 1);
        }
    }
}

// Determines the sequence of edges forming the unique path between two specified vertices in the tree.
function findPathEdges(sourceVertexIdx, destinationVertexIdx) {
    const pathEdges = [];

    // Basic input validation
    if (sourceVertexIdx < 0 || sourceVertexIdx >= graphVertices.length ||
        destinationVertexIdx < 0 || destinationVertexIdx >= graphVertices.length) {
        console.error("Invalid vertex index provided for path finding. Returning empty array.");
        return [];
    }

    // If start and end are the same, path is empty.
    if (sourceVertexIdx === destinationVertexIdx) {
        return pathEdges;
    }

    let currentA = sourceVertexIdx;
    let currentB = destinationVertexIdx;

    let depthA = graphVertices[currentA].level;
    let depthB = graphVertices[currentB].level;

    // Traverse up the tree until both nodes are at the same depth.
    while (depthA > depthB) {
        // Node A is deeper, move A up.
        const parentA = graphVertices[currentA].parentIndex;
        if (parentA === null) { // Should not happen in a connected tree after arrangement
            console.error(`Node ${currentA} has no parent but is not root. Tree structure error. Returning empty array.`);
            return [];
        }
        pathEdges.push(constructEdgeIdentifier(currentA, parentA));
        currentA = parentA;
        depthA--;
    }
    while (depthB > depthA) {
        // Node B is deeper, move B up.
        const parentB = graphVertices[currentB].parentIndex;
        if (parentB === null) { // Should not happen
            console.error(`Node ${currentB} has no parent but is not root. Tree structure error. Returning empty array.`);
            return [];
        }
        pathEdges.push(constructEdgeIdentifier(currentB, parentB));
        currentB = parentB;
        depthB--;
    }

    // Now both nodes are at the same depth. Move both up until they meet (at their lowest common ancestor).
    while (currentA !== currentB) {
        const parentA = graphVertices[currentA].parentIndex;
        const parentB = graphVertices[currentB].parentIndex;

        if (parentA === null || parentB === null) { // Should not happen for valid paths in a connected tree
             console.error("Reached root without nodes meeting. Disconnected graph or tree structure error. Returning empty array.");
             return [];
        }

        pathEdges.push(constructEdgeIdentifier(currentA, parentA));
        pathEdges.push(constructEdgeIdentifier(currentB, parentB));

        currentA = parentA;
        currentB = parentB;
    }

    // Return the unique set of edges that form the path.
    return removeDuplicates(pathEdges);
}

// Calculates the union of sets of forbidden paths based on bitmask combinations.
// The result is a map where keys are binary strings representing subsets of restrictions,
// and values are unique lists of edges in the union of those restrictions.
function calculatePathUnions() {
    const combinedRestrictionsMap = {};
    const totalRestrictions = forbiddenPaths.length;

    // If there are no restrictions, return an empty map.
    if (totalRestrictions === 0) {
        return combinedRestrictionsMap;
    }

    // Iterate through all possible non-empty subsets of restrictions using a bitmask.
    // Each 'i' represents a bitmask: if the k-th bit is set, the k-th restriction is included.
    for (let i = 1; i < Math.pow(2, totalRestrictions); i++) {
        const subsetMaskBinary = i.toString(2); // e.g., "1", "10", "11", "100"

        // If only one bit is set in the mask (e.g., "1", "10", "100"),
        // this corresponds to a single restriction.
        if (countCharOccurrences(subsetMaskBinary, "1") === 1) {
            // Determine the index of the restriction represented by this single bit.
            // For "1" (i=1), index is 0. For "10" (i=2), index is 1. For "100" (i=4), index is 2.
            const restrictionIndex = Math.log2(i);
            combinedRestrictionsMap[subsetMaskBinary] = forbiddenPaths[restrictionIndex];
        } else {
            // For subsets with multiple restrictions, combine previous results.
            // Split the current bitmask into its highest set bit and the remainder.
            // Example: for "110" (i=6):
            //   - highest set bit: "100" (i=4)
            //   - remaining bits: "010" (i=2)
            // This allows building up unions from smaller, already computed unions.

            // Find the highest set bit's value (e.g., 4 for 110)
            const highestBitValue = Math.pow(2, Math.floor(Math.log2(i)));
            const highestBitMaskBinary = highestBitValue.toString(2); // e.g., "100"

            // Find the remaining bits' value (e.g., 2 for 110 - 100 = 010)
            const remainingBitsValue = i - highestBitValue;
            const remainingBitsMaskBinary = remainingBitsValue.toString(2); // e.g., "10"

            // Retrieve the unions for the two smaller subsets and combine them.
            const unionA = combinedRestrictionsMap[highestBitMaskBinary] || [];
            const unionB = combinedRestrictionsMap[remainingBitsMaskBinary] || [];

            combinedRestrictionsMap[subsetMaskBinary] = removeDuplicates(unionA.concat(unionB));
        }
    }
    return combinedRestrictionsMap;
}

// Main function to process the graph data and calculate the final result.
function processGraphData(rawData) {
    // Ensure rawData is a string, handle potential empty input.
    if (typeof rawData !== 'string' || rawData.trim() === '') {
        console.error("Input data is empty or invalid. Returning 0.");
        return 0;
    }

    const inputLines = rawData.split("\n");
    let currentLineIdx = 0;

    // Parse the number of vertices (N).
    const numberOfVertices = Number(inputLines[currentLineIdx++]);
    if (isNaN(numberOfVertices) || numberOfVertices <= 0) {
        console.error("Invalid number of vertices specified. Returning 0.");
        return 0;
    }

    // Initialize all graph vertices.
    // Each vertex stores its ID, a list of adjacent nodes, its depth (level in tree), and its parent.
    for (let vId = 0; vId < numberOfVertices; vId++) {
        graphVertices.push({
            vertexId: vId,
            adjacentNodes: [], // Initially stores all connected nodes, later pruned to actual children
            level: 0,          // Depth in the tree, root is 0
            parentIndex: null  // Parent in the tree structure
        });
    }

    // Parse edge connections for N-1 lines.
    // Establishes initial adjacency lists for the graph.
    for (let edgeCount = 0; edgeCount < numberOfVertices - 1; edgeCount++) {
        const edgeDefinition = inputLines[currentLineIdx++].split(" ");
        const vertex1 = Number(edgeDefinition[0]) - 1; // Adjust to 0-indexed
        const vertex2 = Number(edgeDefinition[1]) - 1; // Adjust to 0-indexed

        // Add bidirectional connections.
        graphVertices[vertex1].adjacentNodes.push(vertex2);
        graphVertices[vertex2].adjacentNodes.push(vertex1);
    }

    // Organize the graph into a rooted tree structure.
    // This sets 'parentIndex' and 'level' for all nodes, starting from vertex 0 as the root.
    buildTreeStructure(graphVertices[0]);

    // Parse the number of restrictions (M).
    const numberOfRestrictions = Number(inputLines[currentLineIdx++]);
    if (isNaN(numberOfRestrictions) || numberOfRestrictions < 0) {
        console.error("Invalid number of restrictions specified. Returning 0.");
        return 0;
    }

    // Process each restriction to find the path (list of edges) between restricted nodes.
    for (let rCount = 0; rCount < numberOfRestrictions; rCount++) {
        const restrictionDefinition = inputLines[currentLineIdx++].split(" ");
        const restrictedVertexA = Number(restrictionDefinition[0]) - 1;
        const restrictedVertexB = Number(restrictionDefinition[1]) - 1;
        forbiddenPaths.push(findPathEdges(restrictedVertexA, restrictedVertexB));
    }

    // Calculate all possible unions of forbidden paths.
    const resultantSetsOfEdges = calculatePathUnions();

    let totalPatternCount = 0;

    // Iterate through the calculated unions to determine the final pattern count.
    // This logic implements the Principle of Inclusion-Exclusion.
    for (const [binaryKey, edgeSet] of Object.entries(resultantSetsOfEdges)) {
        const countOfSetBits = countCharOccurrences(binaryKey, "1");
        const uniqueEdgesInUnion = edgeSet.length;

        // The formula involves N - (1 + number of unique edges in the union).
        // This calculates the number of ways to color the remaining (N-1 - uniqueEdges) edges.
        const exponentValue = numberOfVertices - 1 - uniqueEdgesInUnion;

        // Calculate 2 raised to the power of remaining edges.
        const waysToColorRemainingEdges = Math.pow(2, exponentValue);

        // Apply inclusion-exclusion: add if odd number of restrictions, subtract if even.
        if (countOfSetBits % 2 === 1) {
            totalPatternCount += waysToColorRemainingEdges;
        } else {
            totalPatternCount -= waysToColorRemainingEdges;
        }
    }

    // The initial total possible colorings (2^(N-1)) minus the result from inclusion-exclusion.
    // This typically finds the number of ways to color the edges such that *none* of the restrictions are violated.
    const finalResult = Math.pow(2, numberOfVertices - 1) - totalPatternCount;
    console.log(finalResult);
}

// This line handles standard input and calls the main processing function.
// It should remain unchanged as per the problem statement's implicit requirement.
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));