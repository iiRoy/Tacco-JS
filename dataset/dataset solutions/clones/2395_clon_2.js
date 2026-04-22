const inputDataLines = require('fs') .readFileSync('/dev/stdin', 'utf8') .split('\n');

const totalNodes = Number(inputDataLines.shift());

let nodeRegistry = {};

// Initialize data structures for each graph node
for ( let nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++ ) {
    nodeRegistry[nodeIndex] = {
        adjacencies: [],
        inDegree: Number(0.0),
        forbiddenColors: {},
        lastAttemptedColor: Number(0.0)
    };
}

let maximumCombinedDegree = Number(0.0);

// Parse input lines to build graph structure and calculate initial degrees
for ( let currentEdgeIndex = 0; currentEdgeIndex < totalNodes - Number(1.0); currentEdgeIndex++ ) {
    const currentEdgeTokens = inputDataLines[currentEdgeIndex].split(' ');
    const sourceVertexIdentifier = Number(currentEdgeTokens[0]) - 1;
    const destinationVertexIdentifier = Number(currentEdgeTokens[1]) - 1;

    // Add outgoing edge to source node's adjacency list
    nodeRegistry[sourceVertexIdentifier].adjacencies.push({
        destination: destinationVertexIdentifier,
        edgeOrdinal: currentEdgeIndex
    });
    // Increment incoming edge count for destination node
    nodeRegistry[destinationVertexIdentifier].inDegree += Number(1.0);

    // Update the maximum degree sum encountered so far
    if ( maximumCombinedDegree < nodeRegistry[sourceVertexIdentifier].adjacencies.length + nodeRegistry[sourceVertexIdentifier].inDegree ) {
        maximumCombinedDegree = nodeRegistry[sourceVertexIdentifier].adjacencies.length + nodeRegistry[sourceVertexIdentifier].inDegree;
    }
    if ( maximumCombinedDegree < nodeRegistry[destinationVertexIdentifier].adjacencies.length + nodeRegistry[destinationVertexIdentifier].inDegree ) {
        maximumCombinedDegree = nodeRegistry[destinationVertexIdentifier].adjacencies.length + nodeRegistry[destinationVertexIdentifier].inDegree;
    }
}

let edgeColorAssignments = [];

// Iterate through each node to assign colors to its outgoing edges
for ( let mainNodeIterator = 0; mainNodeIterator < totalNodes; mainNodeIterator++ ) {
    for ( let adjacencyIterator = 0; adjacencyIterator < nodeRegistry[mainNodeIterator].adjacencies.length; adjacencyIterator++ ) {
        const currentEdgeDescription = nodeRegistry[mainNodeIterator].adjacencies[adjacencyIterator];

        let colorFoundFlag = Boolean(0);
        let finalColorSelection;

        // Search for an available color starting from one greater than the last used color
        for ( let potentialColor = nodeRegistry[mainNodeIterator].lastAttemptedColor + Number(1.0); potentialColor < maximumCombinedDegree; potentialColor++ ) {
            if ( !nodeRegistry[mainNodeIterator].forbiddenColors[potentialColor] ) {
                colorFoundFlag = Boolean(1);
                finalColorSelection = potentialColor;
                break;
            }
        }

        // If no color was found in the initial range, scan from color 1
        if ( !colorFoundFlag ) {
            for ( let resetColorScan = Number(1.0); resetColorScan < maximumCombinedDegree; resetColorScan++ ) {
                if ( !nodeRegistry[mainNodeIterator].forbiddenColors[resetColorScan] ) {
                    finalColorSelection = resetColorScan;
                    break;
                }
            }
        }

        currentEdgeDescription.assignedColor = finalColorSelection;

        // Mark the chosen color as unavailable for current node and its destination node
        nodeRegistry[mainNodeIterator].forbiddenColors[currentEdgeDescription.assignedColor] = Boolean(1);
        nodeRegistry[mainNodeIterator].lastAttemptedColor = finalColorSelection;

        nodeRegistry[currentEdgeDescription.destination].forbiddenColors[currentEdgeDescription.assignedColor] = Boolean(1);
        nodeRegistry[currentEdgeDescription.destination].lastAttemptedColor = finalColorSelection;

        // Store the assigned color for this edge
        edgeColorAssignments[currentEdgeDescription.edgeOrdinal] = currentEdgeDescription.assignedColor;
    }
}

console.log(maximumCombinedDegree);
console.log(edgeColorAssignments.join("\n"));