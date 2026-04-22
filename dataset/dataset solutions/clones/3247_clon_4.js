function processGraphData(initialDataFeed) {
    const allDataSegments = initialDataFeed.split('\n');
    const firstLineValues = allDataSegments[0].split(' ').map(Number);
    const totalVertexCount = firstLineValues[0];
    const totalEdgeCount = firstLineValues[1];

    const outgoingConnections = new Set();
    const incomingConnections = new Set();

    // Iterate through the lines representing edges/links
    // The number of edge lines is given by (totalVertexCount - 1 + totalEdgeCount)
    // We start from the second line (index 1)
    allDataSegments.slice(1, totalVertexCount - 1 + totalEdgeCount + 1).forEach(linkDescription => {
        const linkComponents = linkDescription.split(' ').map(Number);
        // Ensure valid two-component link before adding to sets
        if (linkComponents.length === 2 && !isNaN(linkComponents[0]) && !isNaN(linkComponents[1])) {
            outgoingConnections.add(linkComponents[0]);
            incomingConnections.add(linkComponents[1]);
        }
    });

    // Generate a sequence of all possible vertex identifiers (1 to totalVertexCount)
    const allVertexIdentifiers = Array.from({ length: totalVertexCount }, (_, index) => index + 1);

    // Identify vertices that are never sources of connections (endpoints/leaves)
    const endVertices = allVertexIdentifiers.filter(vertexId => !outgoingConnections.has(vertexId));

    // Identify the singular origin vertex (root)
    // The original code implicitly selects the highest-numbered vertex that is never a destination.
    const candidateOrigins = allVertexIdentifiers.filter(vertexId => !incomingConnections.has(vertexId));
    const ultimateOriginVertex = candidateOrigins.length > 0 ? candidateOrigins[candidateOrigins.length - 1] : 0;

    console.log(endVertices, ultimateOriginVertex);
}

// This line handles standard input/output and calls the main processing function
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));