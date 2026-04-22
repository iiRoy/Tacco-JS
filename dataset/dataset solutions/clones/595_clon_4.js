const fileSystemOperations = require('fs');

const initialDataSource = fileSystemOperations.readFileSync('/dev/stdin', 'utf8');
const textRows = initialDataSource.trim().split('\n');

let currentLinePointer = 0;

const graphDimensions = textRows[currentLinePointer++].split(' ').map(Number);
const totalNodes = graphDimensions[0];
const totalMoves = graphDimensions[1];

const edgeWeights = Array.from({ length: totalNodes - 1 }, (_, index) => Number(textRows[currentLinePointer++]));
const movementSequence = Array.from({ length: totalMoves }, (_, index) => Number(textRows[currentLinePointer++]));

const nodeChangeMarkers = new Array(totalNodes).fill(0);
let currentGraphPosition = 0;

movementSequence.forEach(displacementValue => {
    const startNode = currentGraphPosition;
    const endNode = currentGraphPosition + displacementValue;

    if (displacementValue > 0) { // Moving towards higher indices (right)
        nodeChangeMarkers[startNode]++;
        if (endNode < totalNodes) { // Ensure endNode is a valid index for delta array
            nodeChangeMarkers[endNode]--;
        }
    } else { // Moving towards lower indices (left)
        nodeChangeMarkers[endNode]++;
        if (startNode < totalNodes) { // Ensure startNode is a valid index for delta array
            nodeChangeMarkers[startNode]--;
        }
    }
    currentGraphPosition = endNode;
});

const segmentCrossings = [];
let cumulativeCrossings = 0;
for (let segmentIdx = 0; segmentIdx < totalNodes - 1; segmentIdx++) {
    cumulativeCrossings += nodeChangeMarkers[segmentIdx];
    segmentCrossings.push(cumulativeCrossings);
}

const computationModulus = 100000;
const finalComputationResult = segmentCrossings.reduce((aggregate, crossingCount, index) => {
    return (aggregate + (edgeWeights[index] * crossingCount)) % computationModulus;
}, 0);

console.log(finalComputationResult);