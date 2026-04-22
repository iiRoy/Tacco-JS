const sourceData = require('fs').readFileSync(
    '/dev/stdin',
    'utf8'
); // Retrieve raw textual content from standard input file.

const dataLines = sourceData.trim()
                            .split('\n'); // Process input: remove leading/trailing whitespace, then split into an array of lines.

const vertexCount = parseInt(dataLines[0], 10); // Parse the first line to get the total number of vertices (nodes).

// Map remaining lines to an array of arrays representing adjacency lists.
// Each inner array starts with the source vertex, then its degree, followed by connected vertices.
const graphConnections = dataLines.slice(1)
                                 .map( (lineEntry) =>
                                       lineEntry.split(' ').map( (strNum) => parseInt(strNum, 10))
                                 );

// Initialize an adjacency matrix (2D array) with dimensions vertexCount x vertexCount, all values set to 0.
const connectionMap = (new Array(vertexCount))
                      .fill(null)
                      .map( () => (new Array(vertexCount)).fill(0) );

// Populate the connection matrix based on the provided graph connections.
for (let outerIdx = 0; outerIdx < vertexCount; outerIdx++) {
    const currentVertex = graphConnections[outerIdx][0];      // The current source vertex (1-indexed).
    const numNeighbors = graphConnections[outerIdx][1];       // The count of neighbors for the current vertex.
    const connectedVertexIndices = graphConnections[outerIdx].slice(2); // The list of connected destination vertices (1-indexed).

    // Iterate through the list of neighbors for the current vertex.
    for (let innerIdx = 0; innerIdx < numNeighbors; innerIdx++) {
        // Mark the connection in the adjacency matrix.
        // Convert 1-indexed vertex numbers to 0-indexed for array access.
        connectionMap[currentVertex - 1][connectedVertexIndices[innerIdx] - 1] = 1;
    }
}

// Output the final adjacency matrix, with each row's elements joined by a space.
for (let outerIdx = 0; outerIdx < connectionMap.length; outerIdx++) {
    console.log(connectionMap[outerIdx].join(' '));
}