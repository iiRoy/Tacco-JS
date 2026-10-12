const getRawInput = require('fs').readFileSync;

function evaluateGraphPatrol(currentDegrees, allVertices) {
    const totalVertexCount = allVertices.size;

    // Rule 1: If total number of nodes is even, it's not patrollable.
    if (totalVertexCount % 2 === 0) {
        return false;
    }

    let oddDegreeVertexCount = 0;
    // Iterate through degrees to count odd ones
    for (const degreeValue of currentDegrees.values()) {
        if (degreeValue % 2 !== 0) {
            oddDegreeVertexCount++;
        }
    }

    // Rule 2: If no nodes have an odd degree, it's patrollable.
    if (oddDegreeVertexCount === 0) {
        return true;
    }

    // Rule 3: If exactly two nodes have an odd degree, AND these specific nodes are 1 and 2, it's patrollable.
    // Get degrees for nodes 1 and 2. If a node isn't in the map, its degree is 0 (even).
    const degreeOfVertex1 = currentDegrees.get(1) || 0;
    const degreeOfVertex2 = currentDegrees.get(2) || 0;

    if (oddDegreeVertexCount === 2 && (degreeOfVertex1 % 2 !== 0) && (degreeOfVertex2 % 2 !== 0)) {
        return true;
    }

    // If none of the above conditions are met, it's not patrollable.
    return false;
}

// Main execution flow
const rawInputData = getRawInput('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split('\n');

let vertexDegrees = new Map(); // Stores degree for each vertex
let uniqueVertices = new Set(); // Stores all unique vertices encountered

for (const currentLine of inputLines) {
    const [firstNode, secondNode] = currentLine.split(' ').map(Number);

    if (firstNode === 0 && secondNode === 0) {
        // Sentinel value indicates end of current graph
        const result = evaluateGraphPatrol(vertexDegrees, uniqueVertices) ? 'OK' : 'NG';
        console.log(result);

        // Reset for the next graph
        vertexDegrees = new Map();
        uniqueVertices = new Set();
    } else {
        // Add edges and update degrees
        // For firstNode
        vertexDegrees.set(firstNode, (vertexDegrees.get(firstNode) || 0) + 1);
        uniqueVertices.add(firstNode);

        // For secondNode
        vertexDegrees.set(secondNode, (vertexDegrees.get(secondNode) || 0) + 1);
        uniqueVertices.add(secondNode);
    }
}
