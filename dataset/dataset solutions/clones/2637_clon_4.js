const graphInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawLines = graphInput.split('\n');

let lineCursor = 0;
const retrieveLineData = () => rawLines[lineCursor++].split(' ').map(Number);

const [vertexCount, updateCount] = retrieveLineData();

const adjacencyStructure = new Map();
const vertexValueAdjustments = new Map();
const finalAccumulatedValues = new Array(vertexCount).fill(0);

// Initialize graph structures and default vertex values
for (let id = 1; id <= vertexCount; id++) {
    adjacencyStructure.set(id, []);
    vertexValueAdjustments.set(id, 0); // Default value for vertices not receiving updates
}

// Populate adjacency structure with edges
for (let i = 0; i < vertexCount - 1; i++) {
    const [vertexA, vertexB] = retrieveLineData();
    adjacencyStructure.get(vertexA).push(vertexB);
    adjacencyStructure.get(vertexB).push(vertexA);
}

// Apply value adjustments from queries
for (let i = 0; i < updateCount; i++) {
    const [targetVertex, adjustmentAmount] = retrieveLineData();
    vertexValueAdjustments.set(targetVertex, vertexValueAdjustments.get(targetVertex) + adjustmentAmount);
}

const visitedTracker = new Set(); // Keeps track of vertices explored during traversal

// Recursive function to perform depth-first traversal and calculate path sums
const computePathSumRecursive = (currentVertexId, inheritedSumFromParent) => {
    visitedTracker.add(currentVertexId);

    const totalValueAtCurrent = inheritedSumFromParent + vertexValueAdjustments.get(currentVertexId);
    finalAccumulatedValues[currentVertexId - 1] = totalValueAtCurrent;

    const connectedVertices = adjacencyStructure.get(currentVertexId);
    for (const adjacentVertex of connectedVertices) {
        if (!visitedTracker.has(adjacentVertex)) {
            computePathSumRecursive(adjacentVertex, totalValueAtCurrent);
        }
    }
};

// Initiate the traversal from vertex 1 with an initial sum of 0
computePathSumRecursive(1, 0);

console.log(finalAccumulatedValues.join(' '));